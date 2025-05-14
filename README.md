# Library Management System API

A RESTful API for a library management system built with Node.js, Express, TypeScript, Prisma, MySQL, and JWT authentication.

## Features

- **User Authentication**
  - Registration and login
  - JWT-based authentication with access and refresh tokens
  - Auto refresh token functionality
  - Role-based access control (Admin, Librarian, User)

- **Book Management**
  - Create, read, update, and delete books
  - Search and filter books by title, author, category, etc.
  - Track book availability

- **Category Management**
  - Create, read, update, and delete categories
  - Associate books with categories

- **Loan Management**
  - Borrow and return books
  - Track loan status (active, returned, overdue)
  - View loan history

- **Reservation System**
  - Reserve books that are currently unavailable
  - Automatic reservation fulfillment when books become available

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: bcrypt, helmet, rate limiting, CORS

## Project Structure

The project follows the MVC (Model-View-Controller) architecture:

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware functions
├── models/         # Data models and validation schemas
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and JWT secrets

4. Set up the database:
   ```
   pnpm prisma:migrate
   ```

5. Generate Prisma client:
   ```
   pnpm prisma:generate
   ```

6. Start the development server:
   ```
   pnpm dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout (invalidate current token)
- `POST /api/auth/logout-all` - Logout from all devices

### Users

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/change-password` - Change password
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create a new book (admin/librarian)
- `PATCH /api/books/:id` - Update book (admin/librarian)
- `DELETE /api/books/:id` - Delete book (admin/librarian)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category (admin/librarian)
- `PATCH /api/categories/:id` - Update category (admin/librarian)
- `DELETE /api/categories/:id` - Delete category (admin/librarian)

### Loans

- `GET /api/loans/my-loans` - Get current user's loans
- `GET /api/loans` - Get all loans (admin/librarian)
- `GET /api/loans/:id` - Get loan by ID (admin/librarian)
- `POST /api/loans` - Create a new loan (admin/librarian)
- `PATCH /api/loans/:id` - Update loan status (admin/librarian)

### Reservations

- `GET /api/reservations/my-reservations` - Get current user's reservations
- `POST /api/reservations/cancel/:id` - Cancel a reservation
- `GET /api/reservations` - Get all reservations (admin/librarian)
- `GET /api/reservations/:id` - Get reservation by ID (admin/librarian)
- `POST /api/reservations` - Create a new reservation (admin/librarian)
- `PATCH /api/reservations/:id` - Update reservation status (admin/librarian)

## License

ISC
