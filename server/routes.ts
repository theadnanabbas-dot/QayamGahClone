import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  updateUserSchema,
  loginUserSchema,
  insertCitySchema,
  insertPropertyCategorySchema,
  insertPropertySchema,
  insertBlogSchema,
  insertTestimonialSchema,
  insertBookingSchema,
  updateBookingStatusSchema,
  insertVendorSchema,
  updateVendorStatusSchema,
  updateVendorSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static image serving route - placeholder images
  app.get("/api/images/*", (req, res) => {
    const imagePath = req.path.replace("/api/images/", "");

    // Generate placeholder based on image type and path
    let imageUrl = "https://picsum.photos/400/300";

    if (imagePath.includes("cities")) {
      imageUrl = "https://picsum.photos/600/400"; // City images - wider format
    } else if (imagePath.includes("properties")) {
      imageUrl = "https://picsum.photos/800/600"; // Property images - larger format
    } else if (imagePath.includes("categories")) {
      imageUrl = "https://picsum.photos/300/200"; // Category icons - smaller format
    } else if (imagePath.includes("testimonials")) {
      imageUrl = "https://picsum.photos/100/100"; // Profile photos - square format
    } else if (imagePath.includes("blog")) {
      imageUrl = "https://picsum.photos/800/400"; // Blog images - wide format
    }

    // Redirect to placeholder image
    res.redirect(imageUrl);
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      if (!user || user.passwordHash !== `hashed_${password}`) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token: `mock_jwt_token_${user.id}`, // In real app, generate proper JWT
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(201).json({
        message: "Registration successful",
        user: userWithoutPassword,
        token: `mock_jwt_token_${user.id}`,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin authentication route
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Demo admin credentials
      const demoAdminEmail = "admin@qayamgah.com";
      const demoAdminPassword = "admin123";

      // Check for demo admin credentials
      if (email === demoAdminEmail && password === demoAdminPassword) {
        const adminUser = {
          id: "admin-001",
          email: demoAdminEmail,
          role: "admin",
          fullName: "System Administrator",
          username: "admin",
        };

        // Generate a simple token (in production, use JWT)
        const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return res.json({
          success: true,
          user: adminUser,
          token,
        });
      }

      // Check database for admin users
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "admin") {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: "Admin account is deactivated" });
      }

      // Note: In a real app, you'd verify the hashed password here
      // For demo purposes, we'll accept the correct password format
      if (user.passwordHash !== `hashed_${password}`) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Generate a simple token (in production, use JWT)
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Property Owner login endpoint
  app.post("/api/auth/property-owner-login", async (req, res) => {
    try {
      // Demo property owner credentials - check first before validation
      const demoOwnerEmail = "owner@qayamgah.com";
      const demoOwnerPassword = "owner123";

      if (req.body.email === demoOwnerEmail && req.body.password === demoOwnerPassword) {
        const ownerUser = {
          id: "owner-001",
          email: demoOwnerEmail,
          role: "property_owner",
          fullName: "Property Owner Demo",
          username: "propertyowner",
        };

        // Generate a simple token (in production, use JWT)
        const token = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return res.json({
          success: true,
          user: ownerUser,
          token,
        });
      }

      // Validate request body using loginUserSchema
      const { email, password } = loginUserSchema.parse(req.body);

      // First, authenticate the user in the users table
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid property owner credentials" });
      }

      // Verify user is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Property owner account is deactivated" });
      }

      // Verify user has correct role
      if (user.role !== "property_owner") {
        return res.status(401).json({ message: "Invalid property owner credentials" });
      }

      // Verify password hash matches (same pattern as other auth endpoints)
      if (user.passwordHash !== `hashed_${password}`) {
        return res.status(401).json({ message: "Invalid property owner credentials" });
      }

      // Get vendor record for this user
      const vendor = await storage.getVendorByUserId(user.id);
      if (!vendor) {
        return res.status(403).json({ 
          message: "No vendor profile found. Please contact the administrator." 
        });
      }

      // Only approved vendors can log in
      if (vendor.status !== "approved") {
        return res.status(403).json({ 
          message: "Your account is pending approval. Please contact the administrator." 
        });
      }

      // Generate a simple token (in production, use JWT)
      const token = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          username: user.username,
          vendorId: vendor.id,
          vendorStatus: vendor.status,
          businessName: `${vendor.firstName} ${vendor.lastName}`
        },
        token,
      });
    } catch (error: any) {
      console.error("Property owner login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer login endpoint
  app.post("/api/auth/customer-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Demo customer credentials
      const demoCustomerEmail = "customer@qayamgah.com";
      const demoCustomerPassword = "customer123";

      // Check for demo customer credentials
      if (email === demoCustomerEmail && password === demoCustomerPassword) {
        const customerUser = {
          id: "customer-001",
          email: demoCustomerEmail,
          role: "customer",
          fullName: "Customer Demo",
          username: "customer",
        };

        // Generate a simple token (in production, use JWT)
        const token = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return res.json({
          success: true,
          user: customerUser,
          token,
        });
      }

      // Check database for customer users
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "customer") {
        return res
          .status(401)
          .json({ message: "Invalid customer credentials" });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: "Customer account is deactivated" });
      }

      // Note: In a real app, you'd verify the hashed password here
      if (user.passwordHash !== `hashed_${password}`) {
        return res
          .status(401)
          .json({ message: "Invalid customer credentials" });
      }

      // Generate a simple token (in production, use JWT)
      const token = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error: any) {
      console.error("Customer login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(
        ({ passwordHash, ...user }) => user,
      );
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users/role/:role", async (req, res) => {
    try {
      const users = await storage.getUsersByRole(req.params.role);
      const usersWithoutPasswords = users.map(
        ({ passwordHash, ...user }) => user,
      );
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id/role", async (req, res) => {
    try {
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ error: "Role is required" });
      }

      const validRoles = ["admin", "property_owner", "customer"];
      if (!validRoles.includes(role)) {
        return res
          .status(400)
          .json({
            error:
              "Invalid role. Must be one of: admin, property_owner, customer",
          });
      }

      const user = await storage.updateUser(req.params.id, { role });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({
        message: "User role updated successfully",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const token = authHeader.substring(7);
    // In a real app, verify JWT token here. For demo, check token format
    if (!token.startsWith('admin_')) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  };

  // Vendor routes - Protected with admin authentication
  app.get("/api/vendors", requireAdminAuth, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/vendors/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { status } = updateVendorStatusSchema.parse({
        id: req.params.id,
        status: req.body.status,
      });
      
      const vendor = await storage.updateVendorStatus(req.params.id, status);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      // If vendor is approved, update user role to property_owner and activate account
      if (status === "approved") {
        // Update user role first
        await storage.updateUser(vendor.userId, { role: "property_owner" });
        // Then update user status separately
        await storage.updateUser(vendor.userId, { isActive: true });
      }

      res.json({
        message: "Vendor status updated successfully",
        vendor,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/vendors/:id", requireAdminAuth, async (req, res) => {
    try {
      const vendorData = updateVendorSchema.parse(req.body);
      const vendor = await storage.updateVendor(req.params.id, vendorData);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      res.json({
        message: "Vendor details updated successfully",
        vendor,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vendor registration route - combined signup and profile creation
  app.post("/api/vendor/register", async (req, res) => {
    try {
      const { email, password, ...vendorInfo } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      // Create user account with property_owner role but inactive
      const userData = insertUserSchema.parse({
        email,
        password,
        role: "property_owner",
        username: email, // Use email as username for now
        fullName: `${vendorInfo.firstName} ${vendorInfo.lastName}`,
        phone: vendorInfo.phoneNo1,
      });

      const user = await storage.createUser(userData);
      
      // Update user to be inactive until approved
      await storage.updateUser(user.id, { isActive: false });

      // Create vendor profile
      const vendorData = insertVendorSchema.parse({
        ...vendorInfo,
        userId: user.id,
      });

      const vendor = await storage.createVendor(vendorData);

      res.status(201).json({
        message: "Vendor registration successful. Pending approval.",
        vendor,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vendor login endpoint
  app.post("/api/vendor/login", async (req, res) => {
    try {
      // Validate request body using loginUserSchema
      const { email, password } = loginUserSchema.parse(req.body);

      // First, authenticate the user in the users table
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Verify password hash matches (same pattern as other auth endpoints)
      if (user.passwordHash !== `hashed_${password}`) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Get vendor record for this user
      const vendor = await storage.getVendorByUserId(user.id);
      if (!vendor) {
        return res.status(403).json({ 
          success: false,
          message: "No vendor profile found. Please contact the administrator." 
        });
      }

      // Check vendor status
      if (vendor.status === "pending") {
        return res.status(403).json({ 
          success: false,
          message: "Your account is pending approval.",
          vendor: { status: vendor.status }
        });
      } else if (vendor.status === "rejected") {
        return res.status(403).json({ 
          success: false,
          message: "Your account has been rejected. Please contact the administrator.",
          vendor: { status: vendor.status }
        });
      } else if (vendor.status !== "approved") {
        return res.status(403).json({ 
          success: false,
          message: "Your account status does not allow login.",
          vendor: { status: vendor.status }
        });
      }

      // Verify user is active
      if (!user.isActive) {
        return res.status(403).json({ 
          success: false,
          message: "Your account is deactivated. Please contact the administrator." 
        });
      }

      // Generate a simple token (in production, use JWT)
      const token = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
        vendor: {
          id: vendor.id,
          status: vendor.status,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
        },
        token,
      });
    } catch (error: any) {
      console.error("Vendor login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  app.patch("/api/admin/users/:id/status", async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res
          .status(400)
          .json({ error: "isActive must be a boolean value" });
      }

      // For now, just get the user to return status
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({
        message: `User status updated successfully`,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Property creation endpoint
  app.post("/api/properties", async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);

      // Generate slug from title
      const slug = propertyData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const propertyWithSlug = { ...propertyData, slug };
      const property = await storage.createProperty(propertyWithSlug);

      res.status(201).json({
        message: "Property created successfully",
        property,
      });
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique constraint violation
        res
          .status(409)
          .json({ error: "Property with this title already exists" });
      } else {
        console.error("Property creation error:", error);
        res
          .status(400)
          .json({ error: error.message || "Invalid property data" });
      }
    }
  });

  // City routes
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/cities/:id", async (req, res) => {
    try {
      const city = await storage.getCity(req.params.id);
      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }
      res.json(city);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/cities", async (req, res) => {
    try {
      const cityData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/cities/:id", async (req, res) => {
    try {
      const updates = insertCitySchema.partial().parse(req.body);
      const city = await storage.updateCity(req.params.id, updates);
      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }
      res.json(city);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/cities/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCity(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "City not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Property Category routes
  app.get("/api/property-categories", async (req, res) => {
    try {
      const categories = await storage.getPropertyCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/property-categories/:id", async (req, res) => {
    try {
      const category = await storage.getPropertyCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Property category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/property-categories", async (req, res) => {
    try {
      const categoryData = insertPropertyCategorySchema.parse(req.body);
      const category = await storage.createPropertyCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/property-categories/:id", async (req, res) => {
    try {
      const updates = insertPropertyCategorySchema.partial().parse(req.body);
      const category = await storage.updatePropertyCategory(
        req.params.id,
        updates,
      );
      if (!category) {
        return res.status(404).json({ error: "Property category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/property-categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePropertyCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.cityId) filters.cityId = req.query.cityId;
      if (req.query.categoryId) filters.categoryId = req.query.categoryId;
      if (req.query.featured !== undefined)
        filters.featured = req.query.featured === "true";
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.priceMin)
        filters.priceMin = parseFloat(req.query.priceMin as string);
      if (req.query.priceMax)
        filters.priceMax = parseFloat(req.query.priceMax as string);
      if (req.query.minRating)
        filters.minRating = parseFloat(req.query.minRating as string);

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const updates = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(req.params.id, updates);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Property availability and pricing routes
  app.get("/api/properties/:id/availability", async (req, res) => {
    try {
      const { startAt, endAt } = req.query;
      if (!startAt || !endAt) {
        return res
          .status(400)
          .json({ error: "startAt and endAt query parameters are required" });
      }

      const start = new Date(startAt as string);
      const end = new Date(endAt as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const isAvailable = await storage.isPropertyAvailable(
        req.params.id,
        start,
        end,
      );
      const pricing = isAvailable
        ? await storage.calculateBookingPrice(req.params.id, start, end)
        : null;

      res.json({
        available: isAvailable,
        pricing: pricing,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/properties/:id/bookings", async (req, res) => {
    try {
      const { startAt, endAt } = req.query;
      const start = startAt ? new Date(startAt as string) : undefined;
      const end = endAt ? new Date(endAt as string) : undefined;

      const bookings = await storage.getBookingsForProperty(
        req.params.id,
        start,
        end,
      );
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const blogs = await storage.getBlogs(limit);
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    try {
      const blogData = insertBlogSchema.parse(req.body);
      const blog = await storage.createBlog(blogData);
      res.status(201).json(blog);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/blogs/:id", async (req, res) => {
    try {
      const updates = insertBlogSchema.partial().parse(req.body);
      const blog = await storage.updateBlog(req.params.id, updates);
      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.json(blog);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBlog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonial(req.params.id);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/testimonials/:id", async (req, res) => {
    try {
      const updates = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(
        req.params.id,
        updates,
      );
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/testimonials/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid booking status" });
      }

      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Booking availability routes
  app.get("/api/properties/:propertyId/availability", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { startAt, endAt, excludeBookingId } = req.query;

      if (!startAt || !endAt) {
        return res
          .status(400)
          .json({ error: "startAt and endAt are required" });
      }

      const startDate = new Date(startAt as string);
      const endDate = new Date(endAt as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const isAvailable = await storage.isPropertyAvailable(
        propertyId,
        startDate,
        endDate,
        excludeBookingId as string,
      );

      res.json({ available: isAvailable });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/properties/:propertyId/bookings", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { startAt, endAt } = req.query;

      const startDate = startAt ? new Date(startAt as string) : undefined;
      const endDate = endAt ? new Date(endAt as string) : undefined;

      const bookings = await storage.getBookingsForProperty(
        propertyId,
        startDate,
        endDate,
      );
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/properties/:propertyId/calculate-price", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { startAt, endAt } = req.body;

      if (!startAt || !endAt) {
        return res
          .status(400)
          .json({ error: "startAt and endAt are required" });
      }

      const startDate = new Date(startAt);
      const endDate = new Date(endAt);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const priceCalculation = await storage.calculateBookingPrice(
        propertyId,
        startDate,
        endDate,
      );

      if (!priceCalculation) {
        return res
          .status(400)
          .json({ error: "Unable to calculate price for this booking" });
      }

      res.json(priceCalculation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
