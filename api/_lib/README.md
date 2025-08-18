# Jiu-Jitsu IBB Management System

## Overview

The Jiu-Jitsu IBB Management System is a modern web application designed for managing Jiu-Jitsu classes at Igreja Batista do Bacacheri (IBB). This application provides separate interfaces for students and administrators, featuring functionalities such as class check-ins with geolocation validation, student management, attendance tracking, and administrative oversight.

## Features

- **User Roles**: The application supports multiple user roles including Students, Professors, Administrators, and Coordinators.
- **Authentication**: Secure JWT-based authentication with password hashing using bcrypt.
- **Geolocation Check-ins**: GPS-based location verification for class attendance.
- **Responsive Design**: A mobile-first approach using Tailwind CSS for styling.
- **Admin Dashboard**: An intuitive dashboard for administrators to manage students and view statistics.
- **Student Management**: Easy management of student records, including adding, editing, and viewing profiles.

## Tech Stack

- **Frontend**: 
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - Radix UI for accessible components
  - TanStack React Query for server state management

- **Backend**: 
  - Node.js with Express.js
  - PostgreSQL with Supabase for database management
  - Drizzle ORM for type-safe database queries

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- PostgreSQL database (using Supabase)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Jiujitsu_IBB
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Supabase database and update the connection details in the server configuration.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- **Admin Login**: Access the admin interface using the admin login modal.
- **Student Registration**: Students can register and log in to manage their profiles and check-in for classes.
- **Dashboard**: Administrators can view statistics and manage student records from the admin dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.