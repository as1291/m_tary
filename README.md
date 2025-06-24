# Military Asset Management System

A comprehensive web-based system for managing military assets, equipment, and operations across multiple bases with role-based access control and audit logging.

## 🚀 Features

- **Multi-Base Management**: Manage assets across different military bases
- **Equipment Tracking**: Track equipment types, assets, and their lifecycle
- **Purchase Management**: Record and track equipment purchases
- **Transfer Operations**: Handle asset transfers between bases
- **Assignment Tracking**: Assign assets to personnel and track returns
- **Expenditure Logging**: Record asset usage and expenditures
- **Role-Based Access Control**: Different access levels for admins, logistics officers, and base commanders
- **Audit Logging**: Complete audit trail for all system operations
- **Responsive UI**: Modern, mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React** with Vite for fast development and optimized builds
- **Material-UI (MUI)** for consistent, professional UI components
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **CORS** for cross-origin resource sharing
- **Custom audit plugin** for transaction logging

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/military-asset-management.git
cd military-asset-management
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

```bash
# Start the backend server
npm start
```

The backend will be running at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Military Asset Handler
VITE_ENVIRONMENT=development
```

```bash
# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 🔐 User Roles & Permissions

### Admin
- Full system access
- Manage all bases, equipment types, and assets
- Access audit logs
- Delete any records

### Logistics Officer
- Create and edit most resources
- Limited delete permissions
- Manage purchases, transfers, and assignments
- View data across all bases

### Base Commander
- View and manage resources within assigned base only
- Limited editing capabilities
- Cannot delete critical records

## 📊 Data Models

### Core Entities
- **Bases**: Military installations with commanders and locations
- **Equipment Types**: Categories of military equipment
- **Assets**: Individual equipment items with serial numbers
- **Purchases**: Procurement records with suppliers and costs
- **Transfers**: Asset movements between bases
- **Assignments**: Asset assignments to personnel
- **Expenditures**: Usage and consumption tracking
- **Audit Logs**: Complete change history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Resource Management
- `GET|POST|PATCH|DELETE /api/bases` - Base management
- `GET|POST|PATCH|DELETE /api/equipmentTypes` - Equipment type management
- `GET|POST|PATCH|DELETE /api/assets` - Asset management
- `GET|POST|PATCH|DELETE /api/purchases` - Purchase management
- `GET|POST|PATCH|DELETE /api/transfers` - Transfer management
- `GET|POST|PATCH|DELETE /api/assignments` - Assignment management
- `GET|POST|PATCH|DELETE /api/expenditures` - Expenditure management

### Audit & Monitoring
- `GET /api/audit-logs` - Audit log retrieval with filtering

🚀 Deployment
Frontend (Vercel)

https://m-tary-pvxjfonpu-amrits-projects-62895204.vercel.app/login

Backend (Render)

https://m-tary.onrender.com/
