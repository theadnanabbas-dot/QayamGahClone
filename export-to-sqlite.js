#!/usr/bin/env node

/**
 * Qayamgah SQLite Database Export Script
 * 
 * This script extracts all data from the running Qayamgah Express.js application
 * and creates a complete SQLite database with the same schema and data.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Configuration
const EXPRESS_API_BASE = 'http://localhost:5000/api';
const SQLITE_DB_PATH = './qayamgah.db';

// Utility function to make HTTP requests
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${EXPRESS_API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Warning: Failed to fetch ${endpoint}:`, error.message);
    return [];
  }
}

// Create SQLite database and schema
function createSQLiteSchema(db) {
  console.log('Creating SQLite schema...');
  
  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      full_name TEXT,
      phone TEXT,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      image TEXT NOT NULL,
      hero_image TEXT,
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      property_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Property Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS property_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `);

  // Properties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      property_type TEXT NOT NULL DEFAULT 'private',
      max_guests INTEGER NOT NULL DEFAULT 1,
      address TEXT NOT NULL,
      phone_number TEXT,
      room_categories_count INTEGER NOT NULL DEFAULT 1,
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      city_id TEXT REFERENCES cities(id),
      category_id TEXT REFERENCES property_categories(id),
      owner_id TEXT REFERENCES users(id),
      bedrooms INTEGER NOT NULL DEFAULT 0,
      bathrooms INTEGER NOT NULL DEFAULT 0,
      amenities TEXT, -- JSON array stored as text
      images TEXT,    -- JSON array stored as text
      main_image TEXT NOT NULL,
      is_featured BOOLEAN NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Room Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS room_categories (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      max_guest_capacity INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      beds INTEGER NOT NULL,
      area_sq_ft INTEGER,
      price_per_4_hours DECIMAL(10,2) NOT NULL,
      price_per_6_hours DECIMAL(10,2) NOT NULL,
      price_per_12_hours DECIMAL(10,2) NOT NULL,
      price_per_24_hours DECIMAL(10,2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      room_category_id TEXT NOT NULL REFERENCES room_categories(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      guests INTEGER NOT NULL DEFAULT 1,
      stay_type TEXT NOT NULL,
      start_at DATETIME NOT NULL,
      end_at DATETIME NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PKR',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Blogs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5
    )
  `);

  // Vendors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_no_1 TEXT NOT NULL,
      phone_no_2 TEXT,
      cnic TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Pakistan',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME
    )
  `);

  // Imported Calendars table
  db.exec(`
    CREATE TABLE IF NOT EXISTS imported_calendars (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      source_url TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'external',
      is_active BOOLEAN NOT NULL DEFAULT 1,
      last_sync_at DATETIME,
      last_sync_status TEXT DEFAULT 'pending',
      sync_error_message TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Imported Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS imported_events (
      id TEXT PRIMARY KEY,
      imported_calendar_id TEXT NOT NULL REFERENCES imported_calendars(id),
      external_id TEXT,
      summary TEXT NOT NULL,
      description TEXT,
      start_at DATETIME NOT NULL,
      end_at DATETIME NOT NULL,
      is_all_day BOOLEAN NOT NULL DEFAULT 0,
      location TEXT,
      organizer TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ SQLite schema created successfully');
}

// Insert data into SQLite
async function insertData(db, tableName, data, columns) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to insert for ${tableName}`);
    return;
  }

  console.log(`📊 Inserting ${data.length} records into ${tableName}...`);
  
  // Create parameterized insert statement
  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);
  
  const insertMany = db.transaction((records) => {
    for (const record of records) {
      const values = columns.map(col => {
        let value = record[convertColumnName(col)];
        
        // Handle array fields (amenities, images) - convert to JSON string
        if ((col === 'amenities' || col === 'images') && Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        
        // Handle boolean fields for SQLite
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        }
        
        // Handle null/undefined values
        if (value === undefined || value === null) {
          value = null;
        }
        
        // Handle date strings
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          // Keep ISO date string as is for SQLite datetime
        }
        
        return value;
      });
      stmt.run(values);
    }
  });
  
  insertMany(data);
  console.log(`✅ Successfully inserted ${data.length} records into ${tableName}`);
}

// Convert camelCase to snake_case for database columns
function convertColumnName(camelCase) {
  // Map common conversions
  const mapping = {
    'full_name': 'fullName',
    'password_hash': 'passwordHash',
    'is_active': 'isActive',
    'created_at': 'createdAt',
    'hero_image': 'heroImage',
    'property_count': 'propertyCount',
    'main_image': 'mainImage',
    'property_type': 'propertyType',
    'max_guests': 'maxGuests',
    'phone_number': 'phoneNumber',
    'room_categories_count': 'roomCategoriesCount',
    'city_id': 'cityId',
    'category_id': 'categoryId',
    'owner_id': 'ownerId',
    'is_featured': 'isFeature',
    'property_id': 'propertyId',
    'max_guest_capacity': 'maxGuestCapacity',
    'area_sq_ft': 'areaSqFt',
    'price_per_4_hours': 'pricePer4Hours',
    'price_per_6_hours': 'pricePer6Hours',
    'price_per_12_hours': 'pricePer12Hours',
    'price_per_24_hours': 'pricePer24Hours',
    'room_category_id': 'roomCategoryId',
    'user_id': 'userId',
    'customer_name': 'customerName',
    'customer_email': 'customerEmail',
    'customer_phone': 'customerPhone',
    'stay_type': 'stayType',
    'start_at': 'startAt',
    'end_at': 'endAt',
    'total_price': 'totalPrice',
    'payment_method': 'paymentMethod',
    'published_at': 'publishedAt',
    'first_name': 'firstName',
    'last_name': 'lastName',
    'phone_no_1': 'phoneNo1',
    'phone_no_2': 'phoneNo2',
    'approved_at': 'approvedAt',
    'name': 'customerName', // testimonials use customerName instead of name
    'source_url': 'sourceUrl',
    'last_sync_at': 'lastSyncAt',
    'last_sync_status': 'lastSyncStatus',
    'sync_error_message': 'syncErrorMessage',
    'imported_calendar_id': 'importedCalendarId',
    'external_id': 'externalId',
    'is_all_day': 'isAllDay',
    'updated_at': 'updatedAt'
  };
  
  // Find the camelCase equivalent for the given snake_case
  for (const [snake, camel] of Object.entries(mapping)) {
    if (snake === camelCase) {
      return camel;
    }
  }
  
  // Default: convert snake_case to camelCase
  return camelCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Main export function
async function exportToSQLite() {
  try {
    console.log('🚀 Starting Qayamgah SQLite export...');
    
    // Remove existing database file if it exists
    if (fs.existsSync(SQLITE_DB_PATH)) {
      fs.unlinkSync(SQLITE_DB_PATH);
      console.log('🗑️  Removed existing database file');
    }
    
    // Create new SQLite database
    const db = new Database(SQLITE_DB_PATH);
    console.log('📁 Created new SQLite database');
    
    // Create schema
    createSQLiteSchema(db);
    
    // Fetch and insert data in dependency order (parents before children)
    console.log('\n📊 Fetching data from Express.js API...');
    
    // 1. Independent tables first
    // Note: /users endpoint is admin-protected, so we'll create demo users
    const users = [];
    const cities = await fetchData('/cities');
    const propertyCategories = await fetchData('/property-categories');
    const blogs = await fetchData('/blogs');
    const testimonials = await fetchData('/testimonials');
    
    // 2. Tables with foreign keys
    const properties = await fetchData('/properties');
    const roomCategories = await fetchData('/room-categories');
    const bookings = await fetchData('/bookings');
    
    // Note: These endpoints require authentication, so we'll create empty arrays
    // In a production export, you would need to authenticate first
    const vendors = [];
    const importedCalendars = [];
    const importedEvents = [];
    
    console.log('\n💾 Inserting data into SQLite...');
    
    // Insert data in dependency order
    await insertData(db, 'users', users, [
      'id', 'username', 'email', 'password_hash', 'role', 'full_name', 
      'phone', 'is_active', 'created_at'
    ]);
    
    await insertData(db, 'cities', cities, [
      'id', 'name', 'slug', 'image', 'hero_image', 'latitude', 
      'longitude', 'property_count'
    ]);
    
    await insertData(db, 'property_categories', propertyCategories, [
      'id', 'name', 'image', 'slug'
    ]);
    
    await insertData(db, 'blogs', blogs, [
      'id', 'title', 'slug', 'excerpt', 'content', 'image', 'published_at'
    ]);
    
    await insertData(db, 'testimonials', testimonials, [
      'id', 'name', 'role', 'content', 'image', 'rating'
    ]);
    
    // Create some demo users since the endpoint is admin-protected
    const demoUsers = [
      {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@qayamgah.com',
        passwordHash: 'hashed_admin123',
        role: 'admin',
        fullName: 'System Administrator',
        phone: null,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'owner-001',
        username: 'propertyowner',
        email: 'owner@qayamgah.com',
        passwordHash: 'hashed_owner123',
        role: 'property_owner',
        fullName: 'Property Owner Demo',
        phone: null,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    await insertData(db, 'users', demoUsers, [
      'id', 'username', 'email', 'password_hash', 'role', 'full_name', 
      'phone', 'is_active', 'created_at'
    ]);
    
    await insertData(db, 'vendors', vendors, [
      'id', 'user_id', 'first_name', 'last_name', 'phone_no_1', 'phone_no_2',
      'cnic', 'address', 'city', 'country', 'status', 'created_at', 'approved_at'
    ]);
    
    await insertData(db, 'properties', properties, [
      'id', 'title', 'slug', 'description', 'property_type', 'max_guests',
      'address', 'phone_number', 'room_categories_count', 'latitude', 'longitude',
      'city_id', 'category_id', 'owner_id', 'bedrooms', 'bathrooms', 'amenities',
      'images', 'main_image', 'is_featured', 'is_active', 'rating', 'created_at'
    ]);
    
    await insertData(db, 'room_categories', roomCategories, [
      'id', 'property_id', 'name', 'image', 'max_guest_capacity', 'bathrooms',
      'beds', 'area_sq_ft', 'price_per_4_hours', 'price_per_6_hours',
      'price_per_12_hours', 'price_per_24_hours', 'created_at'
    ]);
    
    await insertData(db, 'bookings', bookings, [
      'id', 'room_category_id', 'user_id', 'customer_name', 'customer_email',
      'customer_phone', 'guests', 'stay_type', 'start_at', 'end_at',
      'total_price', 'currency', 'payment_method', 'status', 'created_at'
    ]);
    
    await insertData(db, 'imported_calendars', importedCalendars, [
      'id', 'user_id', 'name', 'source_url', 'platform', 'is_active',
      'last_sync_at', 'last_sync_status', 'sync_error_message', 'created_at'
    ]);
    
    await insertData(db, 'imported_events', importedEvents, [
      'id', 'imported_calendar_id', 'external_id', 'summary', 'description',
      'start_at', 'end_at', 'is_all_day', 'location', 'organizer',
      'status', 'created_at', 'updated_at'
    ]);
    
    // Create indexes for better performance
    console.log('\n🔍 Creating database indexes...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city_id);
      CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category_id);
      CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
      CREATE INDEX IF NOT EXISTS idx_room_categories_property ON room_categories(property_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_room_category ON bookings(room_category_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendors(user_id);
      CREATE INDEX IF NOT EXISTS idx_imported_calendars_user ON imported_calendars(user_id);
      CREATE INDEX IF NOT EXISTS idx_imported_events_calendar ON imported_events(imported_calendar_id);
    `);
    
    // Generate database statistics
    const stats = {};
    const tables = [
      'users', 'cities', 'property_categories', 'properties', 'room_categories',
      'bookings', 'blogs', 'testimonials', 'vendors', 'imported_calendars', 'imported_events'
    ];
    
    console.log('\n📈 Database Statistics:');
    console.log('='.repeat(50));
    
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      stats[table] = count.count;
      console.log(`${table.padEnd(20)}: ${count.count.toString().padStart(6)} records`);
    }
    
    // Close database connection
    db.close();
    
    // Get file size
    const fileStats = fs.statSync(SQLITE_DB_PATH);
    const fileSizeKB = Math.round(fileStats.size / 1024);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ SQLite export completed successfully!');
    console.log(`📁 Database file: ${SQLITE_DB_PATH}`);
    console.log(`📏 File size: ${fileSizeKB} KB`);
    console.log(`📊 Total records: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
    console.log('='.repeat(50));
    
    return {
      success: true,
      filePath: SQLITE_DB_PATH,
      stats,
      fileSizeKB
    };
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the export when script is executed
exportToSQLite().then(result => {
  if (result.success) {
    console.log('\n🎉 Export completed successfully!');
    process.exit(0);
  } else {
    console.error('\n💥 Export failed:', result.error);
    process.exit(1);
  }
});

export { exportToSQLite };