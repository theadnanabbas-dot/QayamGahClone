import { storage } from "./storage";

export async function loadSampleData() {
  // Create Cities with realistic property counts that will be calculated dynamically
  const karachi = await storage.createCity({
    name: "Karachi",
    slug: "karachi",
    image: "/api/images/cities/karachi.jpg",
    heroImage: "/api/images/cities/karachi-hero.jpg",
    latitude: 24.8607,
    longitude: 67.0011,
    propertyCount: 0 // Will update after creating properties
  });

  const lahore = await storage.createCity({
    name: "Lahore",
    slug: "lahore", 
    image: "/api/images/cities/lahore.jpg",
    heroImage: "/api/images/cities/lahore-hero.jpg",
    latitude: 31.5204,
    longitude: 74.3587,
    propertyCount: 0 // Will update after creating properties
  });

  const islamabad = await storage.createCity({
    name: "Islamabad",
    slug: "islamabad",
    image: "/api/images/cities/islamabad.jpg", 
    heroImage: "/api/images/cities/islamabad-hero.jpg",
    latitude: 33.6844,
    longitude: 73.0479,
    propertyCount: 0 // Will update after creating properties
  });

  const rawalpindi = await storage.createCity({
    name: "Rawalpindi",
    slug: "rawalpindi",
    image: "/api/images/cities/rawalpindi.jpg",
    heroImage: "/api/images/cities/rawalpindi-hero.jpg",
    latitude: 33.5651,
    longitude: 73.0169,
    propertyCount: 0 // Will update after creating properties
  });

  const faisalabad = await storage.createCity({
    name: "Faisalabad",
    slug: "faisalabad",
    image: "/api/images/cities/faisalabad.jpg",
    heroImage: "/api/images/cities/faisalabad-hero.jpg",
    latitude: 31.4504,
    longitude: 73.1350,
    propertyCount: 0 // Will update after creating properties
  });

  // Create Property Categories
  const apartments = await storage.createPropertyCategory({
    name: "Apartments",
    slug: "apartments",
    image: "/api/images/categories/apartments.png"
  });

  const houses = await storage.createPropertyCategory({
    name: "Houses", 
    slug: "houses",
    image: "/api/images/categories/houses.png"
  });

  const hotels = await storage.createPropertyCategory({
    name: "Hotels",
    slug: "hotels",
    image: "/api/images/categories/hotels.png"
  });

  const dailyRental = await storage.createPropertyCategory({
    name: "Daily Rental",
    slug: "daily-rental", 
    image: "/api/images/categories/daily-rental.png"
  });

  const commercial = await storage.createPropertyCategory({
    name: "Commercial",
    slug: "commercial",
    image: "/api/images/categories/commercial.png"
  });

  const office = await storage.createPropertyCategory({
    name: "Office",
    slug: "office",
    image: "/api/images/categories/office.png"
  });

  const newBuildings = await storage.createPropertyCategory({
    name: "New Buildings",
    slug: "new-buildings",
    image: "/api/images/categories/new-buildings.png"
  });

  // Create more realistic property owners
  const owners = [];
  
  const owner1 = await storage.createUser({
    username: "syed_properties",
    password: "password123"
  });
  owners.push(owner1);

  const owner2 = await storage.createUser({
    username: "malik_hospitality", 
    password: "password123"
  });
  owners.push(owner2);

  const owner3 = await storage.createUser({
    username: "ahmed_real_estate",
    password: "password123"
  });
  owners.push(owner3);

  const owner4 = await storage.createUser({
    username: "zainab_properties",
    password: "password123"
  });
  owners.push(owner4);

  const owner5 = await storage.createUser({
    username: "hassan_ventures",
    password: "password123"
  });
  owners.push(owner5);

  // Helper function to randomly select from array
  const randomChoice = (array: any[]) => array[Math.floor(Math.random() * array.length)];

  // Create comprehensive property dataset (25 properties)
  const properties = [];
  
  // Featured Properties (Premium Hotels & Apartments)
  properties.push(await storage.createProperty({
    title: "Pearl Continental Karachi",
    slug: "pearl-continental-karachi",
    description: "Luxury 5-star hotel in the heart of Karachi with world-class amenities and services. Perfect for business travelers and hourly bookings.",
    pricePerHour: 150.00,
    pricePerDay: 2800.00,
    minHours: 2,
    maxGuests: 4,
    address: "Club Road, Karachi",
    latitude: 24.8151,
    longitude: 67.0074,
    cityId: karachi.id,
    categoryId: hotels.id,
    ownerId: owner1.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Concierge", "Business Center", "Spa"],
    images: [
      "/api/images/properties/pearl-continental-1.jpg",
      "/api/images/properties/pearl-continental-2.jpg",
      "/api/images/properties/pearl-continental-3.jpg"
    ],
    mainImage: "/api/images/properties/pearl-continental-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.8
  }));

  properties.push(await storage.createProperty({
    title: "Serena Hotel Islamabad",
    slug: "serena-hotel-islamabad",
    description: "Premium hotel with stunning views of Margalla Hills. Ideal for executives and business meetings with flexible hourly rates.",
    pricePerHour: 175.00,
    pricePerDay: 3200.00,
    minHours: 3,
    maxGuests: 4,
    address: "Khayaban-e-Suharwardy, Islamabad",
    latitude: 33.7064,
    longitude: 73.0522,
    cityId: islamabad.id,
    categoryId: hotels.id,
    ownerId: owner2.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Free WiFi", "Air Conditioning", "Gym", "Pool", "Restaurant", "Valet Parking"],
    images: [
      "/api/images/properties/serena-islamabad-1.jpg",
      "/api/images/properties/serena-islamabad-2.jpg"
    ],
    mainImage: "/api/images/properties/serena-islamabad-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.9
  }));

  properties.push(await storage.createProperty({
    title: "Luxury Apartment DHA Karachi",
    slug: "luxury-apartment-dha-karachi",
    description: "Modern 3-bedroom apartment in prestigious DHA Phase 5. Perfect for families and extended stays with hourly booking options.",
    pricePerHour: 95.00,
    pricePerDay: 1800.00,
    minHours: 2,
    maxGuests: 6,
    address: "Phase 5, DHA, Karachi",
    latitude: 24.8267,
    longitude: 67.0789,
    cityId: karachi.id,
    categoryId: apartments.id,
    ownerId: owner3.id,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["Free Parking", "WiFi", "Air Conditioning", "Kitchen", "Balcony"],
    images: [
      "/api/images/properties/dha-luxury-1.jpg",
      "/api/images/properties/dha-luxury-2.jpg",
      "/api/images/properties/dha-luxury-3.jpg"
    ],
    mainImage: "/api/images/properties/dha-luxury-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.6
  }));

  properties.push(await storage.createProperty({
    title: "Executive Villa Gulberg Lahore",
    slug: "executive-villa-gulberg-lahore",
    description: "Spacious executive villa in Gulberg with premium amenities. Ideal for business meetings and corporate events.",
    pricePerHour: 120.00,
    pricePerDay: 2200.00,
    minHours: 3,
    maxGuests: 8,
    address: "Gulberg III, Lahore",
    latitude: 31.5497,
    longitude: 74.3436,
    cityId: lahore.id,
    categoryId: houses.id,
    ownerId: owner4.id,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["Private Garden", "WiFi", "Air Conditioning", "Parking", "Security", "Kitchen"],
    images: [
      "/api/images/properties/gulberg-villa-1.jpg",
      "/api/images/properties/gulberg-villa-2.jpg"
    ],
    mainImage: "/api/images/properties/gulberg-villa-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.7
  }));

  // Mid-range Properties
  properties.push(await storage.createProperty({
    title: "Nishat Hotel Johar Town",
    slug: "nishat-hotel-johar-town",
    description: "Comfortable hotel in Johar Town with modern facilities and affordable hourly rates.",
    pricePerHour: 65.00,
    pricePerDay: 1200.00,
    minHours: 1,
    maxGuests: 3,
    address: "Johar Town, Lahore",
    latitude: 31.4697,
    longitude: 74.2728,
    cityId: lahore.id,
    categoryId: hotels.id,
    ownerId: owner1.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Air Conditioning", "Restaurant", "Parking"],
    images: ["/api/images/properties/nishat-hotel-1.jpg"],
    mainImage: "/api/images/properties/nishat-hotel-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.2
  }));

  properties.push(await storage.createProperty({
    title: "Cozy Apartment F-7 Islamabad",
    slug: "cozy-apartment-f7-islamabad",
    description: "Well-furnished apartment in F-7 sector, close to business district and shopping centers.",
    pricePerHour: 55.00,
    pricePerDay: 950.00,
    minHours: 2,
    maxGuests: 4,
    address: "F-7 Markaz, Islamabad",
    latitude: 33.7215,
    longitude: 73.0433,
    cityId: islamabad.id,
    categoryId: apartments.id,
    ownerId: owner2.id,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "Parking"],
    images: ["/api/images/properties/f7-apartment-1.jpg"],
    mainImage: "/api/images/properties/f7-apartment-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.1
  }));

  properties.push(await storage.createProperty({
    title: "Business Center PECHS Karachi",
    slug: "business-center-pechs-karachi",
    description: "Modern office space in PECHS area, perfect for meetings and co-working.",
    pricePerHour: 40.00,
    pricePerDay: 600.00,
    minHours: 1,
    maxGuests: 10,
    address: "PECHS Block 2, Karachi",
    latitude: 24.8707,
    longitude: 67.0734,
    cityId: karachi.id,
    categoryId: office.id,
    ownerId: owner3.id,
    bedrooms: 0,
    bathrooms: 2,
    amenities: ["Conference Room", "WiFi", "Projector", "Air Conditioning", "Reception"],
    images: ["/api/images/properties/pechs-office-1.jpg"],
    mainImage: "/api/images/properties/pechs-office-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.3
  }));

  properties.push(await storage.createProperty({
    title: "Daily Rental House Clifton",
    slug: "daily-rental-house-clifton",
    description: "Spacious house near Clifton Beach, perfect for family gatherings and events.",
    pricePerHour: 75.00,
    pricePerDay: 1400.00,
    minHours: 4,
    maxGuests: 12,
    address: "Block 4, Clifton, Karachi",
    latitude: 24.8138,
    longitude: 67.0254,
    cityId: karachi.id,
    categoryId: dailyRental.id,
    ownerId: owner4.id,
    bedrooms: 5,
    bathrooms: 3,
    amenities: ["Garden", "BBQ Area", "Parking", "WiFi", "Kitchen", "Living Room"],
    images: ["/api/images/properties/clifton-house-1.jpg"],
    mainImage: "/api/images/properties/clifton-house-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.4
  }));

  properties.push(await storage.createProperty({
    title: "Studio Apartment Bahria Town",
    slug: "studio-apartment-bahria-town",
    description: "Modern studio apartment in Bahria Town with all amenities included.",
    pricePerHour: 45.00,
    pricePerDay: 800.00,
    minHours: 2,
    maxGuests: 2,
    address: "Bahria Town, Rawalpindi",
    latitude: 33.5229,
    longitude: 73.1046,
    cityId: rawalpindi.id,
    categoryId: apartments.id,
    ownerId: owner5.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Kitchen", "Air Conditioning", "Parking", "Security"],
    images: ["/api/images/properties/bahria-studio-1.jpg"],
    mainImage: "/api/images/properties/bahria-studio-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.0
  }));

  properties.push(await storage.createProperty({
    title: "Heritage Hotel Mall Road",
    slug: "heritage-hotel-mall-road",
    description: "Historic hotel on famous Mall Road with traditional Pakistani hospitality.",
    pricePerHour: 70.00,
    pricePerDay: 1300.00,
    minHours: 2,
    maxGuests: 3,
    address: "Mall Road, Lahore",
    latitude: 31.5656,
    longitude: 74.3242,
    cityId: lahore.id,
    categoryId: hotels.id,
    ownerId: owner1.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Restaurant", "Laundry", "Room Service"],
    images: ["/api/images/properties/heritage-hotel-1.jpg"],
    mainImage: "/api/images/properties/heritage-hotel-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.1
  }));

  // Budget Properties
  properties.push(await storage.createProperty({
    title: "Budget Inn Saddar Karachi",
    slug: "budget-inn-saddar-karachi",
    description: "Affordable accommodation in Saddar area, close to business district.",
    pricePerHour: 25.00,
    pricePerDay: 450.00,
    minHours: 1,
    maxGuests: 2,
    address: "Saddar Town, Karachi",
    latitude: 24.8546,
    longitude: 67.0218,
    cityId: karachi.id,
    categoryId: hotels.id,
    ownerId: owner2.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Air Conditioning", "24h Reception"],
    images: ["/api/images/properties/budget-inn-1.jpg"],
    mainImage: "/api/images/properties/budget-inn-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 3.8
  }));

  properties.push(await storage.createProperty({
    title: "Shared Office Space I-8",
    slug: "shared-office-space-i8",
    description: "Affordable co-working space in I-8 sector with modern facilities.",
    pricePerHour: 20.00,
    pricePerDay: 350.00,
    minHours: 1,
    maxGuests: 6,
    address: "I-8 Markaz, Islamabad",
    latitude: 33.6643,
    longitude: 73.0169,
    cityId: islamabad.id,
    categoryId: commercial.id,
    ownerId: owner3.id,
    bedrooms: 0,
    bathrooms: 1,
    amenities: ["WiFi", "Printer", "Coffee", "Air Conditioning"],
    images: ["/api/images/properties/i8-office-1.jpg"],
    mainImage: "/api/images/properties/i8-office-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 3.9
  }));

  properties.push(await storage.createProperty({
    title: "Student Hostel Township",
    slug: "student-hostel-township",
    description: "Budget-friendly accommodation for students and young professionals.",
    pricePerHour: 15.00,
    pricePerDay: 300.00,
    minHours: 2,
    maxGuests: 2,
    address: "Township, Lahore",
    latitude: 31.4504,
    longitude: 74.3587,
    cityId: lahore.id,
    categoryId: dailyRental.id,
    ownerId: owner4.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Study Table", "Shared Kitchen"],
    images: ["/api/images/properties/student-hostel-1.jpg"],
    mainImage: "/api/images/properties/student-hostel-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 3.6
  }));

  // Commercial & Office Properties
  properties.push(await storage.createProperty({
    title: "Corporate Tower Shahrah-e-Faisal",
    slug: "corporate-tower-shahrah-e-faisal",
    description: "Premium office space in corporate tower with state-of-the-art facilities.",
    pricePerHour: 85.00,
    pricePerDay: 1500.00,
    minHours: 2,
    maxGuests: 15,
    address: "Shahrah-e-Faisal, Karachi",
    latitude: 24.8829,
    longitude: 67.0971,
    cityId: karachi.id,
    categoryId: office.id,
    ownerId: owner5.id,
    bedrooms: 0,
    bathrooms: 3,
    amenities: ["Conference Rooms", "High-Speed WiFi", "Reception", "Security", "Elevator"],
    images: ["/api/images/properties/corporate-tower-1.jpg"],
    mainImage: "/api/images/properties/corporate-tower-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.5
  }));

  properties.push(await storage.createProperty({
    title: "Creative Hub Liberty Market",
    slug: "creative-hub-liberty-market",
    description: "Artistic workspace near Liberty Market, perfect for creative professionals.",
    pricePerHour: 35.00,
    pricePerDay: 650.00,
    minHours: 1,
    maxGuests: 8,
    address: "Liberty Market, Lahore",
    latitude: 31.5497,
    longitude: 74.3436,
    cityId: lahore.id,
    categoryId: commercial.id,
    ownerId: owner1.id,
    bedrooms: 0,
    bathrooms: 2,
    amenities: ["WiFi", "Art Supplies", "Photography Setup", "Coffee"],
    images: ["/api/images/properties/creative-hub-1.jpg"],
    mainImage: "/api/images/properties/creative-hub-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.2
  }));

  // More Properties to reach 25+ total
  properties.push(await storage.createProperty({
    title: "Family Guest House G-9",
    slug: "family-guest-house-g9",
    description: "Family-friendly guest house in G-9 sector with home-like atmosphere.",
    pricePerHour: 50.00,
    pricePerDay: 900.00,
    minHours: 3,
    maxGuests: 6,
    address: "G-9/1, Islamabad",
    latitude: 33.6973,
    longitude: 73.0515,
    cityId: islamabad.id,
    categoryId: houses.id,
    ownerId: owner2.id,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ["Kitchen", "WiFi", "Garden", "Parking", "Kids Area"],
    images: ["/api/images/properties/g9-guesthouse-1.jpg"],
    mainImage: "/api/images/properties/g9-guesthouse-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.0
  }));

  properties.push(await storage.createProperty({
    title: "Luxury Penthouse Centaurus",
    slug: "luxury-penthouse-centaurus",
    description: "Premium penthouse in Centaurus Mall complex with panoramic city views.",
    pricePerHour: 200.00,
    pricePerDay: 3500.00,
    minHours: 4,
    maxGuests: 8,
    address: "Jinnah Avenue, Islamabad",
    latitude: 33.7073,
    longitude: 73.0515,
    cityId: islamabad.id,
    categoryId: apartments.id,
    ownerId: owner3.id,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ["Panoramic Views", "Luxury Furnishing", "Private Lift", "Jacuzzi", "WiFi"],
    images: ["/api/images/properties/centaurus-penthouse-1.jpg"],
    mainImage: "/api/images/properties/centaurus-penthouse-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.9
  }));

  properties.push(await storage.createProperty({
    title: "Textile Industry Office Faisalabad",
    slug: "textile-industry-office-faisalabad",
    description: "Professional office space in the heart of Pakistan's textile hub.",
    pricePerHour: 30.00,
    pricePerDay: 550.00,
    minHours: 2,
    maxGuests: 12,
    address: "Jaranwala Road, Faisalabad",
    latitude: 31.4269,
    longitude: 73.0989,
    cityId: faisalabad.id,
    categoryId: office.id,
    ownerId: owner4.id,
    bedrooms: 0,
    bathrooms: 2,
    amenities: ["Meeting Rooms", "WiFi", "Parking", "Security", "Reception"],
    images: ["/api/images/properties/textile-office-1.jpg"],
    mainImage: "/api/images/properties/textile-office-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.1
  }));

  properties.push(await storage.createProperty({
    title: "Modern Apartment Faisalabad",
    slug: "modern-apartment-faisalabad",
    description: "Contemporary apartment in Faisalabad's growing commercial district.",
    pricePerHour: 40.00,
    pricePerDay: 750.00,
    minHours: 2,
    maxGuests: 4,
    address: "Civil Lines, Faisalabad",
    latitude: 31.4220,
    longitude: 73.0784,
    cityId: faisalabad.id,
    categoryId: apartments.id,
    ownerId: owner5.id,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking"],
    images: ["/api/images/properties/faisalabad-apartment-1.jpg"],
    mainImage: "/api/images/properties/faisalabad-apartment-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.0
  }));

  properties.push(await storage.createProperty({
    title: "Executive Lodge Rawalpindi",
    slug: "executive-lodge-rawalpindi",
    description: "Professional lodging for business executives visiting twin cities.",
    pricePerHour: 60.00,
    pricePerDay: 1100.00,
    minHours: 2,
    maxGuests: 3,
    address: "Committee Chowk, Rawalpindi",
    latitude: 33.5984,
    longitude: 73.0344,
    cityId: rawalpindi.id,
    categoryId: hotels.id,
    ownerId: owner1.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Business Center", "Laundry", "Room Service"],
    images: ["/api/images/properties/executive-lodge-1.jpg"],
    mainImage: "/api/images/properties/executive-lodge-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.2
  }));

  properties.push(await storage.createProperty({
    title: "Commercial Plaza Blue Area",
    slug: "commercial-plaza-blue-area",
    description: "Prime commercial space in Islamabad's central business district.",
    pricePerHour: 95.00,
    pricePerDay: 1700.00,
    minHours: 2,
    maxGuests: 20,
    address: "Blue Area, Islamabad",
    latitude: 33.7077,
    longitude: 73.0563,
    cityId: islamabad.id,
    categoryId: commercial.id,
    ownerId: owner2.id,
    bedrooms: 0,
    bathrooms: 4,
    amenities: ["Multiple Conference Rooms", "High-Speed WiFi", "Parking", "Security", "Reception"],
    images: ["/api/images/properties/blue-area-plaza-1.jpg"],
    mainImage: "/api/images/properties/blue-area-plaza-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.6
  }));

  properties.push(await storage.createProperty({
    title: "Boutique Hotel Model Town",
    slug: "boutique-hotel-model-town",
    description: "Charming boutique hotel in prestigious Model Town area.",
    pricePerHour: 80.00,
    pricePerDay: 1450.00,
    minHours: 2,
    maxGuests: 4,
    address: "Model Town, Lahore",
    latitude: 31.4827,
    longitude: 74.3220,
    cityId: lahore.id,
    categoryId: hotels.id,
    ownerId: owner3.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Restaurant", "Garden", "Parking", "Concierge"],
    images: ["/api/images/properties/boutique-hotel-1.jpg"],
    mainImage: "/api/images/properties/boutique-hotel-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.4
  }));

  properties.push(await storage.createProperty({
    title: "New Construction Site Office",
    slug: "new-construction-site-office",
    description: "Temporary office space for construction and development projects.",
    pricePerHour: 25.00,
    pricePerDay: 450.00,
    minHours: 4,
    maxGuests: 8,
    address: "Ring Road, Lahore",
    latitude: 31.4697,
    longitude: 74.2728,
    cityId: lahore.id,
    categoryId: newBuildings.id,
    ownerId: owner4.id,
    bedrooms: 0,
    bathrooms: 2,
    amenities: ["WiFi", "Basic Furniture", "Generator", "Security"],
    images: ["/api/images/properties/construction-office-1.jpg"],
    mainImage: "/api/images/properties/construction-office-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 3.5
  }));

  properties.push(await storage.createProperty({
    title: "Luxury Farm House Murree Road",
    slug: "luxury-farm-house-murree-road",
    description: "Exclusive farm house retreat near Murree Road for special occasions.",
    pricePerHour: 110.00,
    pricePerDay: 2000.00,
    minHours: 6,
    maxGuests: 20,
    address: "Murree Road, Rawalpindi",
    latitude: 33.6844,
    longitude: 73.0479,
    cityId: rawalpindi.id,
    categoryId: houses.id,
    ownerId: owner5.id,
    bedrooms: 6,
    bathrooms: 4,
    amenities: ["Swimming Pool", "BBQ Area", "Garden", "Parking", "Kitchen", "Security"],
    images: ["/api/images/properties/farm-house-1.jpg"],
    mainImage: "/api/images/properties/farm-house-main.jpg",
    isFeature: true,
    isActive: true,
    rating: 4.7
  }));

  properties.push(await storage.createProperty({
    title: "Tech Hub Co-working Space",
    slug: "tech-hub-coworking-space",
    description: "Modern co-working space designed for tech startups and freelancers.",
    pricePerHour: 35.00,
    pricePerDay: 630.00,
    minHours: 1,
    maxGuests: 30,
    address: "Emporium Mall Area, Lahore",
    latitude: 31.4697,
    longitude: 74.2728,
    cityId: lahore.id,
    categoryId: commercial.id,
    ownerId: owner1.id,
    bedrooms: 0,
    bathrooms: 3,
    amenities: ["High-Speed WiFi", "3D Printer", "Meeting Pods", "Coffee Bar", "Gaming Area"],
    images: ["/api/images/properties/tech-hub-1.jpg"],
    mainImage: "/api/images/properties/tech-hub-main.jpg",
    isFeature: false,
    isActive: true,
    rating: 4.3
  }));

  // Calculate and update city property counts
  const cityPropertyCounts = new Map();
  properties.forEach(property => {
    const cityId = property.cityId;
    cityPropertyCounts.set(cityId, (cityPropertyCounts.get(cityId) || 0) + 1);
  });

  // Update city property counts
  await storage.updateCity(karachi.id, { propertyCount: cityPropertyCounts.get(karachi.id) || 0 });
  await storage.updateCity(lahore.id, { propertyCount: cityPropertyCounts.get(lahore.id) || 0 });
  await storage.updateCity(islamabad.id, { propertyCount: cityPropertyCounts.get(islamabad.id) || 0 });
  await storage.updateCity(rawalpindi.id, { propertyCount: cityPropertyCounts.get(rawalpindi.id) || 0 });
  await storage.updateCity(faisalabad.id, { propertyCount: cityPropertyCounts.get(faisalabad.id) || 0 });

  // Create Testimonials with more diverse backgrounds
  await storage.createTestimonial({
    name: "Dr. Ahmed Hassan",
    role: "Medical Consultant", 
    content: "Perfect for my medical conferences in different cities. The hourly booking system saves me money and gives flexibility.",
    image: "/api/images/testimonials/ahmed-hassan.png",
    rating: 5
  });

  await storage.createTestimonial({
    name: "Fatima Sheikh",
    role: "Business Executive",
    content: "Excellent service for business travelers. Clean rooms and professional environment for client meetings.",
    image: "/api/images/testimonials/fatima-sheikh.png", 
    rating: 5
  });

  await storage.createTestimonial({
    name: "Mohammad Ali",
    role: "Software Engineer",
    content: "Great co-working spaces with reliable internet. Perfect for remote work sessions between meetings.",
    image: "/api/images/testimonials/mohammad-ali.png",
    rating: 5
  });

  await storage.createTestimonial({
    name: "Ayesha Khan", 
    role: "Marketing Manager",
    content: "The variety of locations across Pakistan makes business travel so much easier. Highly recommended!",
    image: "/api/images/testimonials/ayesha-khan.png",
    rating: 5
  });

  await storage.createTestimonial({
    name: "Usman Malik",
    role: "Freelance Photographer", 
    content: "Found amazing spaces for photo shoots with flexible hourly rates. Creative hubs are particularly impressive.",
    image: "/api/images/testimonials/usman-malik.png",
    rating: 5
  });

  await storage.createTestimonial({
    name: "Zara Ahmed",
    role: "University Student",
    content: "Budget-friendly options helped me during my internship travels. Clean and safe accommodations.",
    image: "/api/images/testimonials/zara-ahmed.png",
    rating: 5
  });

  // Create Blog Posts relevant to Pakistani market
  await storage.createBlog({
    title: "Best Business Hotels in Karachi for Hourly Bookings",
    slug: "best-business-hotels-karachi-hourly-bookings",
    excerpt: "Discover top-rated business hotels in Karachi that offer flexible hourly booking options for corporate travelers and executives.",
    content: `
      <h2>Best Business Hotels in Karachi for Hourly Bookings</h2>
      <p>Karachi, Pakistan's commercial capital, hosts thousands of business travelers daily. Whether you're attending a conference, meeting clients, or need a professional space between flights, hourly hotel bookings provide the perfect solution.</p>
      
      <h3>Why Choose Hourly Bookings in Karachi?</h3>
      <p>Karachi's business district spans from Saddar to Clifton, with major corporations located throughout the city. Hourly bookings allow you to:</p>
      <ul>
        <li>Save money on accommodation costs</li>
        <li>Book spaces closer to your meeting locations</li>
        <li>Access premium facilities without overnight stays</li>
        <li>Maintain flexibility in your business schedule</li>
      </ul>
      
      <h3>Top Areas for Business Travelers</h3>
      <p><strong>DHA (Defence Housing Authority):</strong> Premium area with luxury hotels and corporate offices.</p>
      <p><strong>Clifton:</strong> Business district near the Arabian Sea with excellent connectivity.</p>
      <p><strong>PECHS:</strong> Central location with easy access to banks and commercial centers.</p>
      
      <h3>What to Look for in Business Hotels</h3>
      <p>When selecting hourly accommodations in Karachi, consider these essential amenities:</p>
      <ul>
        <li>High-speed WiFi for video conferences</li>
        <li>Business centers with printing facilities</li>
        <li>Meeting rooms for client presentations</li>
        <li>Concierge services for local arrangements</li>
        <li>Secure parking for executives</li>
      </ul>
    `,
    image: "/api/images/blog/karachi-business-hotels.jpg"
  });

  await storage.createBlog({
    title: "Lahore's Cultural Heritage and Modern Hospitality",
    slug: "lahore-cultural-heritage-modern-hospitality",
    excerpt: "Experience Lahore's rich cultural heritage while enjoying modern hospitality services with flexible accommodation options.",
    content: `
      <h2>Lahore's Cultural Heritage and Modern Hospitality</h2>
      <p>Lahore, the cultural heart of Pakistan, seamlessly blends its Mughal heritage with modern business facilities. The city offers unique hourly accommodation options that cater to both cultural tourists and business professionals.</p>
      
      <h3>Heritage Locations with Modern Amenities</h3>
      <p>Many properties in Lahore are strategically located near historical sites while offering contemporary facilities:</p>
      <ul>
        <li><strong>Mall Road:</strong> Historic avenue with colonial architecture and modern hotels</li>
        <li><strong>Gulberg:</strong> Commercial hub with luxury accommodations</li>
        <li><strong>Model Town:</strong> Planned community with boutique hospitality options</li>
      </ul>
      
      <h3>Cultural Attractions Nearby</h3>
      <p>When booking hourly accommodations in Lahore, you'll have easy access to:</p>
      <ul>
        <li>Badshahi Mosque - One of the largest mosques in the world</li>
        <li>Lahore Fort - UNESCO World Heritage site</li>
        <li>Shalimar Gardens - Magnificent Mughal gardens</li>
        <li>Anarkali Bazaar - Historic market for shopping</li>
      </ul>
      
      <h3>Business and Leisure Combined</h3>
      <p>Lahore's unique position allows visitors to combine business activities with cultural exploration. Many properties offer packages that include guided tours and business facilities.</p>
    `,
    image: "/api/images/blog/lahore-heritage.jpg"
  });

  await storage.createBlog({
    title: "Islamabad: The Capital's Modern Infrastructure",
    slug: "islamabad-capital-modern-infrastructure", 
    excerpt: "Explore how Islamabad's planned infrastructure makes it ideal for business travelers seeking efficient and comfortable accommodations.",
    content: `
      <h2>Islamabad: The Capital's Modern Infrastructure</h2>
      <p>As Pakistan's capital and most planned city, Islamabad offers exceptional infrastructure for business travelers. The city's organized sectors and modern facilities make it a preferred destination for government officials, diplomats, and corporate executives.</p>
      
      <h3>Strategic Sectors for Business</h3>
      <p>Islamabad's sector-based planning ensures easy navigation and access to business districts:</p>
      <ul>
        <li><strong>Blue Area:</strong> Central business district with government offices</li>
        <li><strong>F-7 Markaz:</strong> Commercial and shopping center</li>
        <li><strong>G-9 Markaz:</strong> Business and residential mixed zone</li>
        <li><strong>I-8 Markaz:</strong> Industrial and commercial area</li>
      </ul>
      
      <h3>Government and Diplomatic Quarter</h3>
      <p>Being the capital, Islamabad hosts numerous government institutions and diplomatic missions. Hourly accommodations near these areas provide:</p>
      <ul>
        <li>Quick access to ministerial meetings</li>
        <li>Proximity to embassy and consulate services</li>
        <li>Professional environment for official business</li>
        <li>Security and protocol compliance</li>
      </ul>
      
      <h3>Natural Beauty and Business</h3>
      <p>Islamabad's location at the foothills of Margalla Hills provides a unique combination of natural beauty and modern business facilities, creating an inspiring environment for corporate activities.</p>
    `,
    image: "/api/images/blog/islamabad-infrastructure.jpg"
  });

  // Create customer users for bookings
  const customer1 = await storage.createUser({
    username: "ahmed_customer",
    email: "ahmed@example.com",
    password: "password123",
    role: "customer",
    fullName: "Ahmed Hassan",
    phone: "+92300123456"
  });

  const customer2 = await storage.createUser({
    username: "fatima_customer", 
    email: "fatima@example.com",
    password: "password123",
    role: "customer",
    fullName: "Fatima Khan",
    phone: "+92301234567"
  });

  const customer3 = await storage.createUser({
    username: "ali_customer",
    email: "ali@example.com", 
    password: "password123",
    role: "customer",
    fullName: "Ali Shah",
    phone: "+92302345678"
  });

  // Create some dummy bookings for testing
  const customers = [customer1, customer2, customer3];
  const bookings = [];

  // Near future booking - can be marked as completed later
  bookings.push(await storage.createBooking({
    propertyId: properties[0].id,
    userId: customers[0].id,
    startAt: new Date(Date.now() + 3600000 * 2), // 2 hours from now
    endAt: new Date(Date.now() + 3600000 * 6), // 6 hours from now
    paymentMethod: "card",
    status: "CONFIRMED",
    currency: "PKR"
  }));

  // Current booking - confirmed  
  bookings.push(await storage.createBooking({
    propertyId: properties[1].id,
    userId: customers[1].id,
    startAt: new Date(Date.now() + 3600000 * 8), // 8 hours from now
    endAt: new Date(Date.now() + 3600000 * 12), // 12 hours from now
    paymentMethod: "jazzcash",
    status: "CONFIRMED",
    currency: "PKR"
  }));

  // Future booking - pending
  bookings.push(await storage.createBooking({
    propertyId: properties[2].id,
    userId: customers[2].id,
    startAt: new Date(Date.now() + 86400000), // 1 day from now
    endAt: new Date(Date.now() + 86400000 + 3600000 * 8), // 8 hours later
    paymentMethod: "cash",
    status: "PENDING",
    currency: "PKR"
  }));

  // Another confirmed booking
  bookings.push(await storage.createBooking({
    propertyId: properties[3].id,
    userId: customers[0].id,
    startAt: new Date(Date.now() + 86400000 * 3), // 3 days from now
    endAt: new Date(Date.now() + 86400000 * 3 + 3600000 * 3), // 3 hours later (meets minHours requirement)
    paymentMethod: "bank_transfer",
    status: "CONFIRMED",
    currency: "PKR"
  }));

  // Cancelled booking
  bookings.push(await storage.createBooking({
    propertyId: properties[4].id,
    userId: customers[1].id,
    startAt: new Date(Date.now() + 86400000 * 5), // 5 days from now
    endAt: new Date(Date.now() + 86400000 * 5 + 3600000 * 3), // 3 hours later
    paymentMethod: "easypaisa",
    status: "CANCELLED",
    currency: "PKR"
  }));

  // Additional pending booking
  bookings.push(await storage.createBooking({
    propertyId: properties[5].id,
    userId: customers[2].id,
    startAt: new Date(Date.now() + 86400000 * 7), // 7 days from now
    endAt: new Date(Date.now() + 86400000 * 7 + 3600000 * 5), // 5 hours later
    paymentMethod: "card",
    status: "PENDING",
    currency: "PKR"
  }));

  console.log(`Sample data loaded successfully! Created ${properties.length} properties across ${cityPropertyCounts.size} cities and ${bookings.length} sample bookings.`);
}