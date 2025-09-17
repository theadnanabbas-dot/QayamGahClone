import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // "admin", "property_owner", "customer"
  fullName: text("full_name"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const cities = pgTable("cities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  heroImage: text("hero_image"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  propertyCount: integer("property_count").notNull().default(0),
});

export const propertyCategories = pgTable("property_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  image: text("image").notNull(),
  slug: text("slug").notNull().unique(),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }),
  minHours: integer("min_hours").notNull().default(1),
  maxGuests: integer("max_guests").notNull().default(1),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  cityId: varchar("city_id").references(() => cities.id),
  categoryId: varchar("category_id").references(() => propertyCategories.id),
  ownerId: varchar("owner_id").references(() => users.id),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  amenities: text("amenities").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  mainImage: text("main_image").notNull(),
  isFeature: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default('0.00'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentMethod: text("payment_method").notNull().default("cash"), // "cash", "card", "bank_transfer", "jazzcash", "easypaisa"
  status: text("status").notNull().default("PENDING"), // "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(),
  publishedAt: timestamp("published_at").notNull().default(sql`now()`),
});

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(),
  rating: integer("rating").notNull().default(5),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNo1: text("phone_no_1").notNull(),
  phoneNo2: text("phone_no_2"),
  cnic: text("cnic").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("Pakistan"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  approvedAt: timestamp("approved_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  isActive: true,
  createdAt: true,
}).extend({
  // For registration, we'll accept plain password and hash it in the backend
  password: z.string().min(6),
  role: z.enum(["admin", "property_owner", "customer"]).default("customer"),
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
}).partial().extend({
  role: z.enum(["admin", "property_owner", "customer"]).optional(),
  isActive: z.boolean().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
});

export const insertPropertyCategorySchema = createInsertSchema(propertyCategories).omit({
  id: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  publishedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
}).extend({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  totalPrice: true, // Server will calculate this, don't accept from client
}).extend({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).default("PENDING"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "jazzcash", "easypaisa"]).default("cash"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  currency: z.string().default("PKR"), // Pakistani Rupee
});

export const updateBookingStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export const updateVendorStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export type InsertPropertyCategory = z.infer<typeof insertPropertyCategorySchema>;
export type PropertyCategory = typeof propertyCategories.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
