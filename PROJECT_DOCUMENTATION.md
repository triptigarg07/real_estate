# Real Estate Enterprise - Full Stack Project Documentation

## Project Overview
This is a comprehensive real estate rental platform that connects property managers with tenants. The application allows managers to list properties and tenants to search, apply, and manage their rentals. It's built as a full-stack application with a modern React frontend and Node.js backend.

## Tech Stack

### Frontend (Client)
- **Framework**: Next.js 15.3.4 (React 18.3.1) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.10 with custom components
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Authentication**: AWS Cognito with Amplify UI
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **File Upload**: FilePond with image preview
- **Maps**: Mapbox GL
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

### Backend (Server)
- **Runtime**: Node.js with Express.js 5.1.0
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens (from AWS Cognito)
- **File Storage**: AWS S3
- **Geospatial**: PostGIS extension for location-based queries
- **Security**: Helmet.js, CORS, Morgan logging
- **File Upload**: Multer for handling multipart/form-data

### Infrastructure & Services
- **Authentication**: AWS Cognito User Pool
- **File Storage**: AWS S3
- **Database**: PostgreSQL with PostGIS
- **Deployment**: PM2 ecosystem configuration

## Project Architecture

### Frontend Architecture

#### 1. **App Router Structure** (`src/app/`)
```
app/
├── (auth)/           # Authentication provider
├── (dashboard)/      # Protected dashboard routes
│   ├── managers/     # Manager-specific pages
│   └── tenants/      # Tenant-specific pages
├── (nondashboard)/   # Public pages
│   ├── landing/      # Landing page components
│   └── search/       # Property search functionality
├── layout.tsx        # Root layout with providers
├── providers.tsx     # Global state providers
└── page.tsx          # Home page
```

#### 2. **Key Frontend Files**

**Authentication System** (`src/app/(auth)/authProvider.tsx`)
- Integrates AWS Cognito for user authentication
- Handles role-based routing (tenant vs manager)
- Custom sign-up form with role selection
- Automatic redirection based on authentication state

**State Management** (`src/state/`)
- `api.ts`: RTK Query API configuration with automatic token handling
- `redux.tsx`: Redux store setup with RTK Query
- `index.ts`: Global state types and interfaces

**Components** (`src/components/`)
- Reusable UI components built with Radix UI primitives
- Custom components like `ApplicationCard`, `AppSidebar`, `Header`
- Form components with validation

**Types** (`src/types/`)
- `index.d.ts`: Global TypeScript declarations
- `prismaTypes.d.ts`: Auto-generated Prisma types

### Backend Architecture

#### 1. **Server Structure** (`server/src/`)
```
src/
├── controllers/      # Business logic handlers
├── middleware/       # Authentication middleware
├── routes/          # API route definitions
├── index.ts         # Server entry point
└── prisma/          # Database schema and migrations
```

#### 2. **Key Backend Files**

**Server Entry** (`src/index.ts`)
- Express server setup with middleware
- Route registration with role-based access control
- CORS, Helmet, and Morgan configuration

**Authentication Middleware** (`src/middleware/authMiddleware.ts`)
- JWT token validation from AWS Cognito
- Role-based access control
- User context injection into requests

**Database Schema** (`prisma/schema.prisma`)
- PostgreSQL with PostGIS for geospatial data
- Comprehensive data models for the rental platform

## Database Design

### Core Models

1. **Property Model**
   - Basic info: name, description, price, deposit, fees
   - Amenities and highlights (enums)
   - Property details: beds, baths, square footage, type
   - Location relationship with geospatial coordinates
   - Manager relationship

2. **User Models**
   - **Manager**: Property managers who list properties
   - **Tenant**: Users who search and rent properties
   - Both linked to AWS Cognito via `cognitoId`

3. **Location Model**
   - Address information with PostGIS coordinates
   - Enables location-based property searches

4. **Application Model**
   - Tenant applications for properties
   - Status tracking (Pending, Denied, Approved)
   - Links to lease when approved

5. **Lease Model**
   - Rental agreements between tenants and properties
   - Payment tracking relationship

6. **Payment Model**
   - Rent and deposit payments
   - Status tracking (Pending, Paid, PartiallyPaid, Overdue)

## API Endpoints

### Public Endpoints
- `GET /properties` - Search and filter properties
- `GET /properties/:id` - Get property details
- `POST /applications` - Submit rental applications

### Protected Endpoints (Tenant)
- `GET /tenants/:id` - Get tenant profile
- `PUT /tenants/:id` - Update tenant settings
- `GET /tenants/:id/current-residences` - Get current rentals
- `POST /tenants/:id/favorites/:propertyId` - Add/remove favorites
- `GET /tenants/:id/favorites` - Get favorite properties
- `GET /tenants/:id/applications` - Get application history

### Protected Endpoints (Manager)
- `GET /managers/:id` - Get manager profile
- `PUT /managers/:id` - Update manager settings
- `GET /managers/:id/properties` - Get managed properties
- `POST /managers/:id/properties` - Create new property
- `PUT /managers/:id/properties/:propertyId` - Update property
- `GET /managers/:id/applications` - Get property applications

## Frontend-Backend Communication

### Authentication Flow
1. **User Registration/Login**: Handled by AWS Cognito via Amplify UI
2. **Token Management**: JWT tokens automatically included in API requests
3. **Role-Based Access**: Frontend routes protected based on user role
4. **API Authorization**: Backend validates tokens and checks user roles

### State Management Flow
1. **RTK Query**: Handles all API calls with automatic caching
2. **Token Injection**: Automatic JWT token inclusion in request headers
3. **Error Handling**: Centralized error handling with toast notifications
4. **Optimistic Updates**: Immediate UI updates with background sync

### Data Flow
1. **Property Search**: Filters sent as query parameters
2. **Real-time Updates**: RTK Query cache invalidation for fresh data
3. **File Uploads**: Direct S3 uploads with presigned URLs
4. **Geospatial Queries**: Location-based property filtering

## Key Features

### For Tenants
- **Property Search**: Advanced filtering by location, price, amenities
- **Favorites System**: Save and manage favorite properties
- **Application Management**: Track rental applications
- **Current Residences**: View active leases and payments
- **Profile Management**: Update personal information

### For Managers
- **Property Management**: Create, edit, and manage property listings
- **Application Review**: Review and approve/deny tenant applications
- **Lease Management**: Track active leases and payments
- **Analytics**: Property performance and application statistics

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Optimistic UI updates with background sync
- **File Upload**: Image upload with preview and optimization
- **Geospatial Search**: Location-based property filtering
- **Role-Based Access**: Secure routes and API endpoints
- **Form Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error handling with user feedback

## Security Implementation

### Frontend Security
- **Route Protection**: Role-based route guards
- **Token Management**: Secure JWT token handling
- **Input Validation**: Client-side validation with Zod schemas
- **XSS Prevention**: Sanitized user inputs

### Backend Security
- **JWT Validation**: Token verification and role checking
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet.js**: Security headers and middleware
- **Input Sanitization**: Server-side validation and sanitization
- **Rate Limiting**: API request throttling

## Deployment & DevOps

### Environment Configuration
- **Environment Variables**: Separate configs for development/production
- **AWS Services**: Cognito, S3, and database configuration
- **PM2 Ecosystem**: Process management for production

### Build Process
- **Frontend**: Next.js build with TypeScript compilation
- **Backend**: TypeScript compilation with Prisma generation
- **Database**: Migration and seeding scripts

## Performance Optimizations

### Frontend
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: RTK Query automatic caching and invalidation
- **Lazy Loading**: Component and route lazy loading

### Backend
- **Database Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connections
- **Caching**: API response caching where appropriate
- **Compression**: Response compression for faster loading

## Testing Strategy

### Frontend Testing
- **Component Testing**: Unit tests for reusable components
- **Integration Testing**: API integration tests
- **E2E Testing**: User flow testing with Playwright

### Backend Testing
- **API Testing**: Endpoint testing with Jest
- **Database Testing**: Integration tests with test database
- **Authentication Testing**: JWT and role-based access tests

## Future Enhancements

### Planned Features
- **Real-time Chat**: Messaging between tenants and managers
- **Payment Integration**: Stripe integration for online payments
- **Advanced Analytics**: Property performance dashboards
- **Mobile App**: React Native mobile application
- **Push Notifications**: Real-time notifications for applications

### Technical Improvements
- **Microservices**: Break down into smaller, focused services
- **GraphQL**: Implement GraphQL for more efficient data fetching
- **WebSocket**: Real-time updates for chat and notifications
- **CDN**: Content delivery network for static assets
- **Monitoring**: Application performance monitoring

## Interview Talking Points

### Architecture Decisions
1. **Why Next.js?** Server-side rendering, routing, and optimization
2. **Why Prisma?** Type-safe database queries and migrations
3. **Why AWS Cognito?** Managed authentication with social login support
4. **Why RTK Query?** Automatic caching, background updates, and optimistic updates

### Technical Challenges Solved
1. **Role-based Access**: Custom middleware for tenant/manager permissions
2. **Geospatial Search**: PostGIS integration for location-based queries
3. **File Upload**: S3 integration with image optimization
4. **Real-time Updates**: Optimistic UI updates with cache invalidation

### Scalability Considerations
1. **Database Design**: Normalized schema with proper relationships
2. **API Design**: RESTful endpoints with proper error handling
3. **Caching Strategy**: RTK Query caching with intelligent invalidation
4. **Security**: JWT tokens, CORS, and input validation

This documentation provides a comprehensive overview of the Real Estate Enterprise application, covering all aspects from frontend to backend, making it perfect for explaining the project during technical interviews. 