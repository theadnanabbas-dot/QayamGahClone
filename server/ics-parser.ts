import { type InsertImportedEvent } from "@shared/schema";

interface ParsedICSEvent {
  uid?: string;
  summary: string;
  description?: string;
  dtstart: Date;
  dtend: Date;
  location?: string;
  organizer?: string;
  status?: string;
  isAllDay: boolean;
}

export class ICSParser {
  /**
   * Fetch ICS content from a URL
   */
  static async fetchICS(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch ICS from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse ICS content and extract events
   */
  static parseICS(icsContent: string): ParsedICSEvent[] {
    const events: ParsedICSEvent[] = [];
    const lines = icsContent.split(/\r?\n/);
    
    let currentEvent: Partial<ParsedICSEvent> | null = null;
    let inEvent = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Handle line folding (continuation lines start with space or tab)
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        line += lines[i].substring(1);
      }

      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
        continue;
      }

      if (line === 'END:VEVENT') {
        if (currentEvent && currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
          events.push({
            uid: currentEvent.uid,
            summary: currentEvent.summary,
            description: currentEvent.description,
            dtstart: currentEvent.dtstart,
            dtend: currentEvent.dtend,
            location: currentEvent.location,
            organizer: currentEvent.organizer,
            status: currentEvent.status || 'confirmed',
            isAllDay: currentEvent.isAllDay || false
          });
        }
        inEvent = false;
        currentEvent = null;
        continue;
      }

      if (!inEvent || !currentEvent) continue;

      // Parse property:value pairs
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const property = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);

      // Parse different property types
      if (property.startsWith('UID')) {
        currentEvent.uid = value;
      } else if (property.startsWith('SUMMARY')) {
        currentEvent.summary = this.unescapeText(value);
      } else if (property.startsWith('DESCRIPTION')) {
        currentEvent.description = this.unescapeText(value);
      } else if (property.startsWith('DTSTART')) {
        const dateInfo = this.parseDateTime(property, value);
        currentEvent.dtstart = dateInfo.date;
        currentEvent.isAllDay = dateInfo.isAllDay;
      } else if (property.startsWith('DTEND')) {
        const dateInfo = this.parseDateTime(property, value);
        currentEvent.dtend = dateInfo.date;
      } else if (property.startsWith('LOCATION')) {
        currentEvent.location = this.unescapeText(value);
      } else if (property.startsWith('ORGANIZER')) {
        // Extract organizer name or email
        if (value.includes('CN=')) {
          const cnMatch = value.match(/CN=([^;:]+)/);
          currentEvent.organizer = cnMatch ? this.unescapeText(cnMatch[1]) : value;
        } else if (value.startsWith('mailto:')) {
          currentEvent.organizer = value.substring(7);
        } else {
          currentEvent.organizer = this.unescapeText(value);
        }
      } else if (property.startsWith('STATUS')) {
        currentEvent.status = value.toLowerCase();
      }
    }

    return events;
  }

  /**
   * Parse ICS date/time values
   */
  private static parseDateTime(property: string, value: string): { date: Date; isAllDay: boolean } {
    let isAllDay = false;
    
    // Check if it's an all-day event (VALUE=DATE)
    if (property.includes('VALUE=DATE') || (value.length === 8 && !value.includes('T'))) {
      isAllDay = true;
      // All-day events are in format YYYYMMDD
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(value.substring(6, 8));
      return { date: new Date(year, month, day), isAllDay };
    }

    // Parse date-time format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
    let dateStr = value;
    let isUTC = false;

    if (dateStr.endsWith('Z')) {
      isUTC = true;
      dateStr = dateStr.slice(0, -1);
    }

    // Extract date and time parts
    const [datePart, timePart] = dateStr.split('T');
    
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1;
    const day = parseInt(datePart.substring(6, 8));
    
    let hour = 0, minute = 0, second = 0;
    if (timePart) {
      hour = parseInt(timePart.substring(0, 2));
      minute = parseInt(timePart.substring(2, 4));
      second = timePart.length >= 6 ? parseInt(timePart.substring(4, 6)) : 0;
    }

    let date: Date;
    if (isUTC) {
      date = new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      date = new Date(year, month, day, hour, minute, second);
    }

    return { date, isAllDay };
  }

  /**
   * Unescape ICS text values
   */
  private static unescapeText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  /**
   * Convert parsed ICS events to ImportedEvent format
   */
  static convertToImportedEvents(
    parsedEvents: ParsedICSEvent[],
    importedCalendarId: string
  ): InsertImportedEvent[] {
    return parsedEvents.map(event => ({
      importedCalendarId,
      externalId: event.uid || undefined,
      summary: event.summary,
      description: event.description || undefined,
      startAt: event.dtstart,
      endAt: event.dtend,
      isAllDay: event.isAllDay,
      location: event.location || undefined,
      organizer: event.organizer || undefined,
      status: event.status as "confirmed" | "tentative" | "cancelled" || "confirmed"
    }));
  }

  /**
   * Full sync process: fetch, parse, and return events ready for database insertion
   */
  static async syncCalendar(sourceUrl: string, importedCalendarId: string): Promise<InsertImportedEvent[]> {
    try {
      const icsContent = await this.fetchICS(sourceUrl);
      const parsedEvents = this.parseICS(icsContent);
      return this.convertToImportedEvents(parsedEvents, importedCalendarId);
    } catch (error) {
      throw new Error(`Calendar sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}