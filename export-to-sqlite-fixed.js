#!/usr/bin/env node

/**
 * Qayamgah SQLite Database Export Script - Fixed Version
 * 
 * This script extracts all data from the running Qayamgah Express.js application
 * and creates a complete SQLite database with the same schema and data.
 */

import Database from 'better-sqlite3';
import fs from 'fs';

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
      amenities TEXT NOT NULL DEFAULT '[]', -- JSON array stored as text
      images TEXT NOT NULL DEFAULT '[]',    -- JSON array stored as text
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
      image TEXT NOT NULL,
      published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Testimonials table (matching shared/schema.ts exactly)
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

  console.log('✅ SQLite schema created successfully');
}

// Helper to handle boolean conversion
function toBool(value) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === 'true' || value === 1) return 1;
  if (value === 'false' || value === 0) return 0;
  return value ? 1 : 0;
}

// Helper to handle JSON arrays
function toJSON(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value;
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
    
    // Fetch data from API
    console.log('\n📊 Fetching data from Express.js API...');
    
    const cities = await fetchData('/cities');
    const propertyCategories = await fetchData('/property-categories');
    const blogs = await fetchData('/blogs');
    const testimonials = await fetchData('/testimonials');
    const properties = await fetchData('/properties');
    const roomCategories = await fetchData('/room-categories');
    const bookings = await fetchData('/bookings');
    
    console.log('\n💾 Inserting data into SQLite...');
    
    // Insert demo users first (since user endpoints are protected)
    console.log('📊 Creating demo users...');
    const userStmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, username, email, password_hash, role, full_name, phone, is_active, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Only create users that are actually referenced in the data to satisfy FK constraints
    // Collect owner IDs and booking user IDs separately to assign correct roles
    const ownerIds = new Set();
    const customerIds = new Set();
    
    // Add owner IDs from properties
    properties.forEach(prop => {
      if (prop.ownerId) ownerIds.add(prop.ownerId);
    });
    
    // Add user IDs from bookings (customers)
    bookings.forEach(booking => {
      if (booking.userId && !ownerIds.has(booking.userId)) {
        customerIds.add(booking.userId);
      }
    });
    
    // Create minimal users with correct roles
    const requiredUsers = [];
    
    // Create property owners
    Array.from(ownerIds).forEach((userId, index) => {
      requiredUsers.push([
        userId,
        `owner${index + 1}`,
        `owner${index + 1}@qayamgah.com`,
        'hashed_password',
        'property_owner',
        `Property Owner ${index + 1}`,
        null,
        1,
        new Date().toISOString()
      ]);
    });
    
    // Create customer users
    Array.from(customerIds).forEach((userId, index) => {
      requiredUsers.push([
        userId,
        `customer${index + 1}`,
        `customer${index + 1}@qayamgah.com`,
        'hashed_password',
        'customer',
        `Customer ${index + 1}`,
        null,
        1,
        new Date().toISOString()
      ]);
    });
    
    for (const user of requiredUsers) {
      userStmt.run(...user);
    }
    console.log(`✅ Successfully inserted ${requiredUsers.length} required users for FK constraints`);
    
    // Insert cities
    if (cities.length > 0) {
      console.log(`📊 Inserting ${cities.length} cities...`);
      const cityStmt = db.prepare(`
        INSERT OR REPLACE INTO cities (id, name, slug, image, hero_image, latitude, longitude, property_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const city of cities) {
        cityStmt.run(
          city.id, city.name, city.slug, city.image, city.heroImage, 
          city.latitude, city.longitude, city.propertyCount || 0
        );
      }
      console.log(`✅ Successfully inserted ${cities.length} cities`);
    }
    
    // Insert property categories
    if (propertyCategories.length > 0) {
      console.log(`📊 Inserting ${propertyCategories.length} property categories...`);
      const categoryStmt = db.prepare(`
        INSERT OR REPLACE INTO property_categories (id, name, image, slug) 
        VALUES (?, ?, ?, ?)
      `);
      
      for (const category of propertyCategories) {
        categoryStmt.run(category.id, category.name, category.image, category.slug);
      }
      console.log(`✅ Successfully inserted ${propertyCategories.length} property categories`);
    }
    
    // Insert blogs (ensure image is not null)
    if (blogs.length > 0) {
      console.log(`📊 Processing ${blogs.length} blogs...`);
      const blogStmt = db.prepare(`
        INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, image, published_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      let inserted = 0;
      for (const blog of blogs) {
        // Only insert if we have ALL required fields (no fabrication)
        if (blog.title && blog.slug && blog.excerpt && blog.content && blog.image) {
          blogStmt.run(
            blog.id, blog.title, blog.slug, blog.excerpt, blog.content, 
            blog.image, blog.publishedAt || new Date().toISOString()
          );
          inserted++;
        } else {
          console.warn(`⚠️  Skipping blog ${blog.id}: missing required fields (title: ${!!blog.title}, slug: ${!!blog.slug}, excerpt: ${!!blog.excerpt}, content: ${!!blog.content}, image: ${!!blog.image})`);
        }
      }
      console.log(`✅ Successfully inserted ${inserted} blogs`);
    }
    
    // Insert testimonials (map API fields to schema fields, skip if missing required data)
    if (testimonials.length > 0) {
      console.log(`📊 Processing ${testimonials.length} testimonials...`);
      const testimonialStmt = db.prepare(`
        INSERT OR REPLACE INTO testimonials (id, name, role, content, image, rating) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      let inserted = 0;
      for (const testimonial of testimonials) {
        // Map API fields to schema fields - skip if missing required data
        const name = testimonial.name || testimonial.customerName;
        const role = testimonial.role;
        const content = testimonial.content || testimonial.comment;
        const image = testimonial.image;
        const rating = testimonial.rating || 5;
        
        // Only insert if we have ALL required fields (no fabrication)
        if (name && role && content && image) {
          testimonialStmt.run(testimonial.id, name, role, content, image, rating);
          inserted++;
        } else {
          console.warn(`⚠️  Skipping testimonial ${testimonial.id}: missing required fields (name: ${!!name}, role: ${!!role}, content: ${!!content}, image: ${!!image})`);
        }
      }
      console.log(`✅ Successfully inserted ${inserted} testimonials`);
    }
    
    // Insert properties
    if (properties.length > 0) {
      console.log(`📊 Inserting ${properties.length} properties...`);
      const propertyStmt = db.prepare(`
        INSERT OR REPLACE INTO properties (
          id, title, slug, description, property_type, max_guests, address, phone_number,
          room_categories_count, latitude, longitude, city_id, category_id, owner_id,
          bedrooms, bathrooms, amenities, images, main_image, is_featured, is_active, rating, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let inserted = 0;
      for (const property of properties) {
        // Get main image from data - no fabrication
        const mainImage = property.mainImage || (property.images && property.images.length > 0 ? property.images[0] : null);
        
        // Only insert if we have all required fields (including main_image)
        if (property.title && property.slug && property.address && mainImage) {
          propertyStmt.run(
            property.id, property.title, property.slug, property.description,
            property.propertyType || 'private', property.maxGuests || 1, property.address,
            property.phoneNumber, property.roomCategoriesCount || 1, property.latitude,
            property.longitude, property.cityId, property.categoryId, property.ownerId,
            property.bedrooms || 0, property.bathrooms || 0, toJSON(property.amenities || []),
            toJSON(property.images || []), mainImage, toBool(property.isFeature),
            toBool(property.isActive), property.rating || 0, property.createdAt || new Date().toISOString()
          );
          inserted++;
        } else {
          console.warn(`⚠️  Skipping property ${property.id}: missing required fields (title: ${!!property.title}, slug: ${!!property.slug}, address: ${!!property.address}, main_image: ${!!mainImage})`);
        }
      }
      console.log(`✅ Successfully inserted ${inserted} properties`);
    }
    
    // Insert room categories
    if (roomCategories.length > 0) {
      console.log(`📊 Inserting ${roomCategories.length} room categories...`);
      const roomStmt = db.prepare(`
        INSERT OR REPLACE INTO room_categories (
          id, property_id, name, image, max_guest_capacity, bathrooms, beds, area_sq_ft,
          price_per_4_hours, price_per_6_hours, price_per_12_hours, price_per_24_hours, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const room of roomCategories) {
        roomStmt.run(
          room.id, room.propertyId, room.name, room.image, room.maxGuestCapacity,
          room.bathrooms, room.beds, room.areaSqFt, room.pricePer4Hours,
          room.pricePer6Hours, room.pricePer12Hours, room.pricePer24Hours,
          room.createdAt || new Date().toISOString()
        );
      }
      console.log(`✅ Successfully inserted ${roomCategories.length} room categories`);
    }
    
    // Insert bookings
    if (bookings.length > 0) {
      console.log(`📊 Inserting ${bookings.length} bookings...`);
      const bookingStmt = db.prepare(`
        INSERT OR REPLACE INTO bookings (
          id, room_category_id, user_id, customer_name, customer_email, customer_phone,
          guests, stay_type, start_at, end_at, total_price, currency, payment_method, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const booking of bookings) {
        bookingStmt.run(
          booking.id, booking.roomCategoryId, booking.userId, booking.customerName,
          booking.customerEmail, booking.customerPhone, booking.guests || 1,
          booking.stayType, booking.startAt, booking.endAt, booking.totalPrice,
          booking.currency || 'PKR', booking.paymentMethod || 'cash',
          booking.status || 'PENDING', booking.createdAt || new Date().toISOString()
        );
      }
      console.log(`✅ Successfully inserted ${bookings.length} bookings`);
    } else {
      console.log('⚠️  No bookings to insert');
    }
    
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
    `);
    
    // Run integrity checks
    console.log('\n🔍 Running database integrity checks...');
    try {
      // Check foreign key constraints
      const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
      if (fkCheck.length > 0) {
        console.warn('⚠️  Foreign key constraint violations found:', fkCheck);
      } else {
        console.log('✅ All foreign key constraints satisfied');
      }
      
      // Quick integrity check
      const integrityCheck = db.prepare('PRAGMA integrity_check').get();
      if (integrityCheck.integrity_check === 'ok') {
        console.log('✅ Database integrity check passed');
      } else {
        console.warn('⚠️  Database integrity issues:', integrityCheck);
      }
    } catch (error) {
      console.warn('⚠️  Could not run integrity checks:', error.message);
    }
    
    // Generate database statistics
    const tables = [
      'users', 'cities', 'property_categories', 'properties', 'room_categories',
      'bookings', 'blogs', 'testimonials'
    ];
    
    console.log('\n📈 Database Statistics:');
    console.log('='.repeat(50));
    
    let totalRecords = 0;
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      totalRecords += count.count;
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
    console.log(`📊 Total records: ${totalRecords}`);
    console.log('='.repeat(50));
    
    return {
      success: true,
      filePath: SQLITE_DB_PATH,
      totalRecords,
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

// Run the export
exportToSQLite().then(result => {
  if (result.success) {
    console.log('\n🎉 Export completed successfully!');
    console.log(`📥 Download your SQLite database: ${result.filePath}`);
    process.exit(0);
  } else {
    console.error('\n💥 Export failed:', result.error);
    process.exit(1);
  }
});

export { exportToSQLite };