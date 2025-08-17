# Jiu-Jitsu IBB Management System

## Overview

A modern web application for managing Jiu-Jitsu classes at Igreja Batista do Bacacheri (IBB). The system provides separate interfaces for students and administrators, featuring class check-ins with geolocation validation, student management, attendance tracking, and administrative oversight. Built as a full-stack application with React frontend and Express backend, utilizing PostgreSQL database with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control
- **Middleware**: Custom logging and error handling middleware
- **Session Management**: PostgreSQL session storage with connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema**: Comprehensive schema supporting users, students, admins, check-ins, class schedules, and events
- **Migrations**: Database migrations managed through Drizzle Kit

### Authentication & Authorization
- **Multi-Role System**: Student, Professor, Administrative, and Coordinator roles
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Role-based route protection on both frontend and backend
- **Password Security**: bcrypt hashing for password storage

### Geolocation Features
- **Check-in Validation**: GPS-based location verification for class attendance
- **Distance Calculation**: Haversine formula implementation for proximity checking
- **Academy Location**: Configurable location settings for validation boundaries

### User Interface Design
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: CSS variable-based theming system
- **Component Library**: Consistent UI with Radix UI and shadcn/ui components
- **Accessibility**: ARIA labels and semantic HTML structure

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Supabase**: Alternative PostgreSQL provider support

### Frontend Libraries
- **TanStack React Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management
- **Wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: Type-safe database toolkit
- **JWT**: JSON Web Token implementation
- **bcryptjs**: Password hashing library
- **postgres**: PostgreSQL client for Node.js

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler for production
- **PostCSS**: CSS processing tool
- **Replit Integration**: Development environment support

### Authentication Services
- **Self-hosted JWT**: No external authentication providers
- **Local session management**: Database-stored sessions

### Geolocation Services
- **Browser Geolocation API**: Native GPS access
- **Custom distance calculation**: No external mapping services required