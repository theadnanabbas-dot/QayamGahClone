# Overview

Qayamgah is a full-stack property rental platform built with React, Express.js, and PostgreSQL. The application enables property owners to list rental spaces while customers can browse, search, and book properties. The system includes role-based access control with three user types: administrators, property owners, and customers, each with dedicated dashboards and functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Authentication**: Session-based authentication with role-based access control
- **File Structure**: Separation of concerns with dedicated routes, storage, and utility modules
- **Development**: Hot reload support with Vite integration

## Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL connection
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Data Modeling**: Relational design with foreign key constraints between users, properties, cities, categories, and bookings

## Core Data Models
- **Users**: Support for admin, property_owner, and customer roles with authentication
- **Properties**: Rental listings with pricing, location, and amenity information
- **Cities**: Geographic organization of properties with metadata
- **Property Categories**: Classification system for different property types
- **Bookings**: Reservation system with status tracking and customer information
- **Blogs**: Content management for platform articles
- **Testimonials**: Customer review and rating system

## Authentication & Authorization
- **Multi-Role System**: Separate login flows and dashboards for each user type
- **Session Management**: Server-side session handling with secure cookies
- **Route Protection**: Role-based access control for different application areas
- **Token Storage**: Client-side token management for maintaining authentication state

## External Dependencies

- **Database**: Neon Database for serverless PostgreSQL hosting
- **Image Handling**: Placeholder image service (Picsum Photos) for development
- **UI Components**: Radix UI for accessible, unstyled components
- **Development Tools**: ESBuild for production builds, TSX for development server
- **Styling**: Google Fonts integration for typography
- **Development Environment**: Replit integration with specialized plugins and banners