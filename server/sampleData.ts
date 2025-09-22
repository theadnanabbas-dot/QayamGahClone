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

  // Create property owners
  const owner1 = await storage.createUser({
    username: "syed_properties",
    password: "password123"
  });

  const owner2 = await storage.createUser({
    username: "malik_hospitality", 
    password: "password123"
  });

  // Create the two remaining properties
  const properties = [];
  
  // Sunrise Residency – Gulshan (Complete Test Property)
  const sunriseResidency = await storage.createProperty({
    title: "Sunrise Residency – Gulshan",
    slug: "sunrise-residency-gulshan",
    description: "A modern boutique stay in the heart of Karachi with flexible booking options.",
    maxGuests: 4,
    address: "Gulshan-e-Iqbal, Karachi",
    latitude: 24.9265,
    longitude: 67.0822,
    cityId: karachi.id,
    categoryId: hotels.id,
    ownerId: owner1.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Free WiFi", "Air Conditioning", "Parking", "24/7 Reception", "Room Service"],
    images: [
      "/api/images/properties/sunrise-residency-1.jpg",
      "/api/images/properties/sunrise-residency-2.jpg",
      "/api/images/properties/sunrise-residency-3.jpg"
    ],
    phoneNumber: "+92 300 1234567",
    isFeature: true,
    isActive: true,
    rating: "4.5"
  });
  properties.push(sunriseResidency);

  // Create room categories for Sunrise Residency
  const sunriseStandardRoom = await storage.createRoomCategory({
    propertyId: sunriseResidency.id,
    name: "Standard Room",
    image: "/api/images/room-categories/standard-room.jpg",
    maxGuestCapacity: 2,
    bathrooms: 1,
    beds: 1, // 1 queen bed
    areaSqFt: 220,
    pricePer4Hours: "1200.00",
    pricePer6Hours: "1800.00",
    pricePer12Hours: "2800.00",
    pricePer24Hours: "4000.00"
  });

  const sunriseDeluxeRoom = await storage.createRoomCategory({
    propertyId: sunriseResidency.id,
    name: "Deluxe Room",
    image: "/api/images/room-categories/deluxe-room.jpg",
    maxGuestCapacity: 3,
    bathrooms: 1,
    beds: 1, // 1 king bed
    areaSqFt: 320,
    pricePer4Hours: "1800.00",
    pricePer6Hours: "2500.00",
    pricePer12Hours: "3600.00",
    pricePer24Hours: "5200.00"
  });

  const sunriseSuite = await storage.createRoomCategory({
    propertyId: sunriseResidency.id,
    name: "Suite",
    image: "/api/images/room-categories/suite.jpg",
    maxGuestCapacity: 4,
    bathrooms: 2,
    beds: 2, // 1 king + sofa bed
    areaSqFt: 500,
    pricePer4Hours: "3000.00",
    pricePer6Hours: "4200.00",
    pricePer12Hours: "6000.00",
    pricePer24Hours: "8000.00"
  });

  // Pearl Continental Karachi
  const pearlContinental = await storage.createProperty({
    title: "Pearl Continental Karachi",
    slug: "pearl-continental-karachi",
    description: "Luxury 5-star hotel in the heart of Karachi with world-class amenities and services. Perfect for business travelers and hourly bookings.",
    maxGuests: 4,
    address: "Club Road, Karachi",
    latitude: 24.8151,
    longitude: 67.0074,
    cityId: karachi.id,
    categoryId: hotels.id,
    ownerId: owner2.id,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Concierge", "Business Center", "Spa"],
    images: [
      "/api/images/properties/pearl-continental-1.jpg",
      "/api/images/properties/pearl-continental-2.jpg",
      "/api/images/properties/pearl-continental-3.jpg"
    ],
    isFeature: true,
    isActive: true,
    rating: "4.8"
  });
  properties.push(pearlContinental);

  // Create room categories for Pearl Continental
  const pearlDeluxeRoom = await storage.createRoomCategory({
    propertyId: pearlContinental.id,
    name: "Deluxe Room",
    image: "/api/images/room-categories/deluxe-room.jpg",
    maxGuestCapacity: 4,
    bathrooms: 1,
    beds: 2,
    areaSqFt: 350,
    pricePer4Hours: "150.00",
    pricePer6Hours: "200.00", 
    pricePer12Hours: "350.00",
    pricePer24Hours: "650.00"
  });

  // Create some admin users for testing
  await storage.createUser({
    username: "admin",
    password: "admin123",
    role: "admin",
    email: "admin@qayamgah.com",
    fullName: "System Administrator",
    phone: "+92-300-1234567"
  });

  // Create some testimonials
  await storage.createTestimonial({
    customerName: "Ahmed Khan",
    rating: 5,
    comment: "Excellent service! The hourly booking option was perfect for my business meeting.",
    propertyId: pearlContinental.id,
    isApproved: true
  });

  await storage.createTestimonial({
    customerName: "Sara Ali",
    rating: 4,
    comment: "Great location and clean rooms. Will definitely book again!",
    propertyId: sunriseResidency.id,
    isApproved: true
  });

  // Create some blog content
  await storage.createBlog({
    title: "Best Business Hotels in Karachi for Hourly Bookings",
    slug: "best-business-hotels-karachi-hourly-bookings",
    excerpt: "Discover top-rated business hotels in Karachi that offer flexible hourly booking options for corporate travelers and executives.",
    content: `
      <h2>Best Business Hotels in Karachi for Hourly Bookings</h2>
      <p>Karachi, Pakistan's commercial capital, hosts thousands of business travelers daily. Whether you're attending a conference, meeting clients, or need a professional space between flights, hourly hotel bookings provide the perfect solution.</p>
      
      <h3>Why Choose Hourly Hotel Bookings?</h3>
      <ul>
        <li>Cost-effective alternative to full-day bookings</li>
        <li>Flexible timing that fits your schedule</li>
        <li>Professional environment for business meetings</li>
        <li>Premium amenities without the premium price</li>
      </ul>
      
      <h3>Top Business Hotels in Karachi</h3>
      <p><strong>Pearl Continental Karachi</strong> stands out as the premier choice for business travelers. Located on Club Road, this luxury hotel offers world-class amenities including business centers, high-speed WiFi, and professional concierge services.</p>
      
      <p><strong>Sunrise Residency</strong> in Gulshan-e-Iqbal provides a modern boutique experience perfect for extended business stays. With flexible booking options and excellent customer service, it's ideal for both short meetings and longer work sessions.</p>
      
      <h3>Booking Tips</h3>
      <ul>
        <li>Book in advance during peak business seasons</li>
        <li>Check for corporate discounts and packages</li>
        <li>Consider location proximity to your business venues</li>
        <li>Verify business center facilities and WiFi quality</li>
      </ul>
    `,
    authorId: owner1.id,
    categoryId: hotels.id,
    isPublished: true,
    isFeatured: true
  });

  // City property counts will be calculated automatically by the system
  
  console.log(`Sample data loaded successfully:
    - Cities: 5
    - Property Categories: 7
    - Properties: 2 (Pearl Continental Karachi, Sunrise Residency Gulshan)
    - Room Categories: 4 total
    - Users: 3 (2 property owners + 1 admin)
    - Testimonials: 2
    - Blogs: 1
  `);
}