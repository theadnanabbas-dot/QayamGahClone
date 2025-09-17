import { 
  type User, 
  type InsertUser,
  type LoginUser,
  type City,
  type InsertCity,
  type PropertyCategory,
  type InsertPropertyCategory,
  type Property,
  type InsertProperty,
  type Blog,
  type InsertBlog,
  type Testimonial,
  type InsertTestimonial,
  type Booking,
  type InsertBooking,
  type Vendor,
  type InsertVendor
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Cities
  getCities(): Promise<City[]>;
  getCity(id: string): Promise<City | undefined>;
  getCityBySlug(slug: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: string, updates: Partial<InsertCity>): Promise<City | undefined>;
  deleteCity(id: string): Promise<boolean>;
  
  // Property Categories
  getPropertyCategories(): Promise<PropertyCategory[]>;
  getPropertyCategory(id: string): Promise<PropertyCategory | undefined>;
  getPropertyCategoryBySlug(slug: string): Promise<PropertyCategory | undefined>;
  createPropertyCategory(category: InsertPropertyCategory): Promise<PropertyCategory>;
  updatePropertyCategory(id: string, updates: Partial<InsertPropertyCategory>): Promise<PropertyCategory | undefined>;
  deletePropertyCategory(id: string): Promise<boolean>;
  
  // Properties
  getProperties(filters?: { cityId?: string; categoryId?: string; featured?: boolean; limit?: number; priceMin?: number; priceMax?: number; minRating?: number }): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Blogs
  getBlogs(limit?: number): Promise<Blog[]>;
  getBlog(id: string): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: string): Promise<boolean>;
  
  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;
  
  // Bookings
  getBookings(userId?: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  
  // Booking Availability
  isPropertyAvailable(propertyId: string, startAt: Date, endAt: Date, excludeBookingId?: string): Promise<boolean>;
  getBookingsForProperty(propertyId: string, startAt?: Date, endAt?: Date): Promise<Booking[]>;
  calculateBookingPrice(propertyId: string, startAt: Date, endAt: Date): Promise<{ totalPrice: number; hours: number } | null>;
  
  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendorStatus(id: string, status: string): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cities: Map<string, City>;
  private propertyCategories: Map<string, PropertyCategory>;
  private properties: Map<string, Property>;
  private blogs: Map<string, Blog>;
  private testimonials: Map<string, Testimonial>;
  private bookings: Map<string, Booking>;
  private vendors: Map<string, Vendor>;

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.propertyCategories = new Map();
    this.properties = new Map();
    this.blogs = new Map();
    this.testimonials = new Map();
    this.bookings = new Map();
    this.vendors = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    // Hash the password (in a real app, use bcrypt)
    const passwordHash = `hashed_${insertUser.password}`;
    const user: User = { 
      id, 
      username: insertUser.username,
      email: insertUser.email,
      passwordHash,
      role: insertUser.role || "customer",
      fullName: insertUser.fullName || null,
      phone: insertUser.phone || null,
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Cities
  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }

  async getCity(id: string): Promise<City | undefined> {
    return this.cities.get(id);
  }

  async getCityBySlug(slug: string): Promise<City | undefined> {
    return Array.from(this.cities.values()).find(city => city.slug === slug);
  }

  async createCity(insertCity: InsertCity): Promise<City> {
    const id = randomUUID();
    const city: City = { 
      ...insertCity, 
      id,
      heroImage: insertCity.heroImage ?? null,
      latitude: insertCity.latitude ?? null,
      longitude: insertCity.longitude ?? null,
      propertyCount: insertCity.propertyCount ?? 0
    };
    this.cities.set(id, city);
    return city;
  }

  // Property Categories
  async getPropertyCategories(): Promise<PropertyCategory[]> {
    return Array.from(this.propertyCategories.values());
  }

  async getPropertyCategory(id: string): Promise<PropertyCategory | undefined> {
    return this.propertyCategories.get(id);
  }

  async getPropertyCategoryBySlug(slug: string): Promise<PropertyCategory | undefined> {
    return Array.from(this.propertyCategories.values()).find(cat => cat.slug === slug);
  }

  async createPropertyCategory(insertCategory: InsertPropertyCategory): Promise<PropertyCategory> {
    const id = randomUUID();
    const category: PropertyCategory = { ...insertCategory, id };
    this.propertyCategories.set(id, category);
    return category;
  }

  // Properties
  async getProperties(filters?: { cityId?: string; categoryId?: string; featured?: boolean; limit?: number; priceMin?: number; priceMax?: number; minRating?: number }): Promise<Property[]> {
    let properties = Array.from(this.properties.values());
    
    if (filters?.cityId) {
      properties = properties.filter(p => p.cityId === filters.cityId);
    }
    
    if (filters?.categoryId) {
      properties = properties.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.featured !== undefined) {
      properties = properties.filter(p => p.isFeature === filters.featured);
    }
    
    if (filters?.priceMin !== undefined) {
      properties = properties.filter(p => parseFloat(p.pricePerHour) >= filters.priceMin!);
    }
    
    if (filters?.priceMax !== undefined) {
      properties = properties.filter(p => parseFloat(p.pricePerHour) <= filters.priceMax!);
    }
    
    if (filters?.minRating !== undefined) {
      properties = properties.filter(p => parseFloat(p.rating) >= filters.minRating!);
    }
    
    if (filters?.limit) {
      properties = properties.slice(0, filters.limit);
    }
    
    return properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    return Array.from(this.properties.values()).find(prop => prop.slug === slug);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: new Date(),
      description: insertProperty.description ?? null,
      pricePerDay: insertProperty.pricePerDay ?? null,
      latitude: insertProperty.latitude ?? null,
      longitude: insertProperty.longitude ?? null,
      cityId: insertProperty.cityId ?? null,
      categoryId: insertProperty.categoryId ?? null,
      ownerId: insertProperty.ownerId ?? null,
      minHours: insertProperty.minHours ?? 1,
      maxGuests: insertProperty.maxGuests ?? 1,
      bedrooms: insertProperty.bedrooms ?? 0,
      bathrooms: insertProperty.bathrooms ?? 0,
      isFeature: insertProperty.isFeature ?? false,
      isActive: insertProperty.isActive ?? true,
      rating: insertProperty.rating ?? "0.00",
      amenities: insertProperty.amenities ?? [],
      images: insertProperty.images ?? []
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Blogs
  async getBlogs(limit?: number): Promise<Blog[]> {
    let blogs = Array.from(this.blogs.values());
    blogs = blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (limit) {
      blogs = blogs.slice(0, limit);
    }
    
    return blogs;
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    return Array.from(this.blogs.values()).find(blog => blog.slug === slug);
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = randomUUID();
    const blog: Blog = { 
      ...insertBlog, 
      id, 
      publishedAt: new Date()
    };
    this.blogs.set(id, blog);
    return blog;
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = { 
      ...insertTestimonial, 
      id, 
      rating: insertTestimonial.rating ?? 5
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Bookings
  async getBookings(userId?: string): Promise<Booking[]> {
    let bookings = Array.from(this.bookings.values());
    
    if (userId) {
      bookings = bookings.filter(booking => booking.userId === userId);
    }
    
    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }


  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid booking status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Optional: Add status transition validation
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["COMPLETED", "CANCELLED"], 
      "CANCELLED": [], // Final state
      "COMPLETED": []  // Final state
    };
    
    if (!validTransitions[booking.status].includes(status)) {
      throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
    }
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Missing User CRUD operations
  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = { 
      ...user, 
      username: updates.username ?? user.username,
      email: updates.email ?? user.email,
      fullName: updates.fullName !== undefined ? updates.fullName : user.fullName,
      phone: updates.phone !== undefined ? updates.phone : user.phone,
      role: updates.role ?? user.role,
      passwordHash: updates.password ? `hashed_${updates.password}` : user.passwordHash
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Missing City CRUD operations
  async updateCity(id: string, updates: Partial<InsertCity>): Promise<City | undefined> {
    const city = this.cities.get(id);
    if (!city) return undefined;

    const updatedCity: City = { 
      ...city, 
      ...updates,
      heroImage: updates.heroImage !== undefined ? updates.heroImage : city.heroImage,
      latitude: updates.latitude !== undefined ? updates.latitude : city.latitude,
      longitude: updates.longitude !== undefined ? updates.longitude : city.longitude,
      propertyCount: updates.propertyCount ?? city.propertyCount
    };
    this.cities.set(id, updatedCity);
    return updatedCity;
  }

  async deleteCity(id: string): Promise<boolean> {
    return this.cities.delete(id);
  }

  // Missing PropertyCategory CRUD operations
  async updatePropertyCategory(id: string, updates: Partial<InsertPropertyCategory>): Promise<PropertyCategory | undefined> {
    const category = this.propertyCategories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updates };
    this.propertyCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deletePropertyCategory(id: string): Promise<boolean> {
    return this.propertyCategories.delete(id);
  }

  // Missing Blog CRUD operations
  async updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog | undefined> {
    const blog = this.blogs.get(id);
    if (!blog) return undefined;

    const updatedBlog = { ...blog, ...updates };
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogs.delete(id);
  }

  // Missing Testimonial CRUD operations
  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;

    const updatedTestimonial: Testimonial = {
      ...testimonial,
      ...updates,
      rating: updates.rating ?? testimonial.rating
    };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    return this.testimonials.delete(id);
  }

  // Critical Booking Availability Logic
  async isPropertyAvailable(propertyId: string, startAt: Date, endAt: Date, excludeBookingId?: string): Promise<boolean> {
    const property = this.properties.get(propertyId);
    if (!property || !property.isActive) {
      return false;
    }

    const bookings = Array.from(this.bookings.values()).filter(booking => 
      booking.propertyId === propertyId && 
      booking.status !== 'CANCELLED' &&
      (excludeBookingId ? booking.id !== excludeBookingId : true)
    );

    for (const booking of bookings) {
      // Check for overlap: booking conflicts if new booking overlaps with existing ones
      if (startAt < booking.endAt && endAt > booking.startAt) {
        return false;
      }
    }

    return true;
  }

  async getBookingsForProperty(propertyId: string, startAt?: Date, endAt?: Date): Promise<Booking[]> {
    let bookings = Array.from(this.bookings.values()).filter(booking => 
      booking.propertyId === propertyId
    );

    if (startAt) {
      bookings = bookings.filter(booking => booking.endAt >= startAt);
    }

    if (endAt) {
      bookings = bookings.filter(booking => booking.startAt <= endAt);
    }

    return bookings.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  async calculateBookingPrice(propertyId: string, startAt: Date, endAt: Date): Promise<{ totalPrice: number; hours: number } | null> {
    const property = this.properties.get(propertyId);
    if (!property) {
      return null;
    }

    const hoursDiff = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
    const hours = Math.ceil(hoursDiff);

    if (hours < property.minHours) {
      return null;
    }

    const hourlyRate = parseFloat(property.pricePerHour);
    let totalPrice = hours * hourlyRate;

    // Apply daily rate if available and beneficial
    if (property.pricePerDay && hours >= 24) {
      const dailyRate = parseFloat(property.pricePerDay);
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      const dailyTotal = days * dailyRate + remainingHours * hourlyRate;
      
      if (dailyTotal < totalPrice) {
        totalPrice = dailyTotal;
      }
    }

    return { totalPrice, hours };
  }

  // Enhanced createBooking with validation and availability checking
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Validation
    if (insertBooking.startAt >= insertBooking.endAt) {
      throw new Error('Start time must be before end time');
    }

    if (insertBooking.startAt <= new Date()) {
      throw new Error('Booking start time must be in the future');
    }

    // Check property exists and is active
    const property = this.properties.get(insertBooking.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isActive) {
      throw new Error('Property is not available for booking');
    }

    // Check availability
    const isAvailable = await this.isPropertyAvailable(
      insertBooking.propertyId, 
      insertBooking.startAt, 
      insertBooking.endAt
    );

    if (!isAvailable) {
      throw new Error('Property is not available for the requested time period');
    }

    // Calculate and validate price
    const priceCalculation = await this.calculateBookingPrice(
      insertBooking.propertyId, 
      insertBooking.startAt, 
      insertBooking.endAt
    );

    if (!priceCalculation) {
      throw new Error('Unable to calculate price for this booking');
    }

    if (priceCalculation.hours < property.minHours) {
      throw new Error(`Minimum booking duration is ${property.minHours} hours`);
    }

    // Validate status transitions
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(insertBooking.status)) {
      throw new Error(`Invalid booking status: ${insertBooking.status}`);
    }

    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      currency: insertBooking.currency ?? "USD",
      totalPrice: priceCalculation.totalPrice.toFixed(2) // Always use server-calculated price for security
    };
    this.bookings.set(id, booking);
    return booking;
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.userId === userId,
    );
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.email === email,
    );
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = {
      ...insertVendor,
      id,
      phoneNo2: insertVendor.phoneNo2 ?? null,
      country: insertVendor.country ?? "Pakistan",
      createdAt: new Date(),
      approvedAt: null,
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendorStatus(id: string, status: string): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updatedVendor: Vendor = {
      ...vendor,
      status,
      approvedAt: status === "approved" ? new Date() : null,
    };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.vendors.delete(id);
  }
}

export const storage = new MemStorage();
