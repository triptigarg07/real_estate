# 🏠 Real Estate Enterprise Platform

A comprehensive real estate management platform built with Next.js, Node.js, and PostgreSQL. This platform connects property managers with tenants, providing a seamless experience for property listings, applications, and lease management.

## ✨ Features

### 🏢 For Property Managers
- **Property Management**: Create, edit, and manage property listings with detailed information
- **Application Processing**: Review and manage tenant applications with status tracking
- **Lease Management**: Handle lease agreements and track payment status
- **Dashboard Analytics**: Monitor property performance and tenant activities
- **Settings Management**: Update profile and account information

### 🏠 For Tenants
- **Property Discovery**: Browse available properties with advanced search and filtering
- **Interactive Maps**: View property locations using Mapbox integration
- **Favorites System**: Save and manage favorite properties
- **Application System**: Submit rental applications with detailed information
- **Residence Management**: View current residences and lease information
- **Personal Dashboard**: Track applications and manage account settings

### 🌐 Public Features
- **Landing Page**: Modern, responsive landing page with property showcase
- **Property Search**: Advanced search with filters for location, price, amenities
- **Property Details**: Comprehensive property information with photo galleries
- **Contact System**: Direct communication between tenants and managers

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling with Zod validation
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Mapbox GL** - Interactive maps
- **AWS Amplify** - Authentication and cloud services

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Database ORM with PostgreSQL
- **PostGIS** - Geographic database extensions
- **JWT** - Authentication tokens
- **AWS S3** - File storage
- **Multer** - File upload handling

### Database
- **PostgreSQL** - Primary database
- **PostGIS** - Geographic data support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- AWS Account (for S3 and Amplify)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/real-estate-enterprise.git
   cd real-estate-enterprise
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both `client/` and `server/` directories:
   
   **Server (.env)**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/real_estate_db"
   JWT_SECRET="your-jwt-secret"
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   S3_BUCKET_NAME="your-s3-bucket"
   ```
   
   **Client (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
   ```

4. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Run the application**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Real_estate_Enterprise/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── (auth)/    # Authentication pages
│   │   │   ├── (dashboard)/ # Dashboard pages for managers/tenants
│   │   │   └── (nondashboard)/ # Public pages (landing, search)
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and constants
│   │   ├── state/         # Redux store and API state
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   └── routes/        # API routes
│   └── prisma/            # Database schema and migrations
```

## 🔧 Key Features Implementation

### Authentication & Authorization
- AWS Cognito integration for user authentication
- Role-based access control (Manager/Tenant)
- JWT token management
- Protected routes and middleware

### Property Management
- CRUD operations for properties
- Image upload to AWS S3
- Geographic data with PostGIS
- Advanced search and filtering

### Application System
- Tenant application submission
- Manager application review
- Status tracking (Pending/Approved/Denied)
- Email notifications

### Payment Tracking
- Lease payment management
- Payment status tracking
- Due date monitoring
- Payment history

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching capability
- **Interactive Maps**: Mapbox integration for property locations
- **Image Galleries**: Property photo management with FilePond
- **Real-time Updates**: Redux state management for dynamic content
- **Accessibility**: ARIA-compliant components with Radix UI

## 🚀 Deployment

This project is deployed on **Vercel** for optimal performance and scalability.

### Frontend Deployment (Vercel)
The Next.js frontend is automatically deployed on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `client`
3. **Environment Variables**: Add your environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

### Backend Deployment
For the backend, you can deploy to:
- **Vercel Functions** (recommended for full-stack)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

### Database Migration
```bash
cd server
npx prisma migrate deploy
```

### Vercel Configuration
Create a `vercel.json` file in the root directory for full-stack deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Prisma](https://www.prisma.io/) for the excellent database ORM
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Mapbox](https://www.mapbox.com/) for mapping services

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using modern web technologies**

**Built by Tripti Garg**
