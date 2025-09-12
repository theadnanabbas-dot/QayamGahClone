import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  passwordHash: true,
}).extend({
  // For registration, we'll accept plain password and hash it in the backend
  password: z.string().min(6),
}).omit({
  passwordHash: true,
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

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  totalPrice: true, // Server will calculate this, don't accept from client
}).extend({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).default("PENDING"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
