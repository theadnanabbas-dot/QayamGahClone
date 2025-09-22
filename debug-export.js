#!/usr/bin/env node

import Database from 'better-sqlite3';
import fs from 'fs';

// Configuration
const EXPRESS_API_BASE = 'http://localhost:5000/api';
const SQLITE_DB_PATH = './qayamgah-debug.db';

// Utility function to make HTTP requests
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${EXPRESS_API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`📊 Fetched ${endpoint}:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.warn(`Warning: Failed to fetch ${endpoint}:`, error.message);
    return [];
  }
}

// Simple test function
async function debugExport() {
  try {
    console.log('🚀 Starting debug export...');
    
    // Remove existing database file if it exists
    if (fs.existsSync(SQLITE_DB_PATH)) {
      fs.unlinkSync(SQLITE_DB_PATH);
    }
    
    // Create new SQLite database
    const db = new Database(SQLITE_DB_PATH);
    
    // Create simple cities table
    db.exec(`
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        image TEXT,
        latitude REAL,
        longitude REAL
      )
    `);
    
    // Fetch cities data
    const cities = await fetchData('/cities');
    
    console.log('🔍 Processing cities data...');
    
    if (cities && cities.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO cities (id, name, slug, image, latitude, longitude) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const city of cities) {
        console.log('📝 Inserting city:', {
          id: city.id,
          name: city.name,
          slug: city.slug,
          image: city.image,
          latitude: city.latitude,
          longitude: city.longitude
        });
        
        try {
          stmt.run(city.id, city.name, city.slug, city.image, city.latitude, city.longitude);
          console.log('✅ Successfully inserted:', city.name);
        } catch (error) {
          console.error('❌ Failed to insert city:', city.name, error.message);
        }
      }
    }
    
    // Test query
    const result = db.prepare('SELECT COUNT(*) as count FROM cities').get();
    console.log(`📊 Total cities in database: ${result.count}`);
    
    db.close();
    console.log('✅ Debug export completed successfully!');
    
  } catch (error) {
    console.error('❌ Debug export failed:', error);
  }
}

// Run the debug export
debugExport();