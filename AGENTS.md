# VynChat Project Handover Documentation

## Project Overview

**VynChat** is a modern real-time chat application built with TypeScript, featuring a blog system and comprehensive chat functionality. The project is currently in early development phase with foundational architecture complete but chat features not yet implemented.

### Key Information
- **Created**: September 5, 2025
- **Framework**: Better-T-Stack (v2.40.4)
- **Architecture**: Monorepo with separate web and server applications
- **Primary Purpose**: Real-time chat application with blogging capabilities

## Technology Stack

### Backend (`apps/server/`)
- **Runtime**: Bun
- **Framework**: Hono (lightweight, performant server framework)
- **API**: oRPC (end-to-end type-safe APIs with OpenAPI integration)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth with admin plugin
- **Environment**: @t3-oss/env-core for type-safe environment variables

### Frontend (`apps/web/`)
- **Framework**: React 19.1.1
- **Routing**: TanStack Router (file-based, type-safe)
- **Styling**: TailwindCSS 4.1.13 with shadcn/ui components
- **State Management**: TanStack Query with oRPC integration
- **UI Components**: Radix UI primitives with custom styling
- **PWA**: Vite PWA plugin for progressive web app features

### Development Tools
- **Monorepo**: Turborepo for build optimization
- **Package Manager**: Bun (v1.2.21)
- **Linting**: Oxlint and Biome
- **Type Checking**: TypeScript 5.9.2
- **Code Quality**: Ultracite

## Project Structure

```
vynchat/
├── apps/
│   ├── web/                 # Frontend React application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── routes/      # TanStack Router pages
│   │   │   ├── lib/         # Utilities and auth client
│   │   │   └── utils/       # oRPC client setup
│   │   └── public/          # Static assets
│   └── server/              # Backend Hono application
│       ├── src/
│       │   ├── routers/     # API endpoint definitions
│       │   ├── db/          # Database schema and migrations
│       │   └── lib/         # Server utilities and auth
│       └── docker-compose.yml # PostgreSQL container
├── package.json             # Root workspace configuration
├── turbo.json              # Turborepo configuration
└── bts.jsonc               # Better-T-Stack settings
```

## Database Architecture

### Core Schema

The database is designed to support both blogging and chat functionality:

#### Blog System (✅ Implemented)
- **`blog`**: Blog posts with slug, title, body, author, categories
- **`tag`**: Blog tags with descriptions
- **`blog_tag`**: Many-to-many relationship for blog tagging
- **`comment`**: Blog comments with approval system
- **`like`**: Blog post likes/reactions

#### Chat System (🔄 Schema Ready, Implementation Pending)
- **`room`**: Chat rooms (public/private/DM support)
- **`message`**: Chat messages with type support (text, file, etc.)
- **`room_members`**: Room membership management
- **`room_moderators`**: Moderation privileges
- **`room_banned`**: User banning per room

#### User Management (✅ Implemented)
- **`user`**: User profiles with roles (admin/user/guest)
- **`session`**: Better-Auth session management
- **`account`**: OAuth and credential authentication
- **`user_followers`** / **`user_following`**: Social features

### Key Database Features
- **CUID2 IDs**: For security and performance
- **Proper Indexing**: Optimized queries for chat and blog
- **Cascade Deletes**: Data integrity maintenance
- **Timezone Support**: All timestamps with timezone
- **Type Safety**: Full Zod schema integration

## Current Implementation Status

### ✅ Completed Features
1. **Project Foundation**
   - Monorepo setup with Turborepo
   - TypeScript configuration across all apps
   - Environment variable management
   - Development and build scripts

2. **Authentication System**
   - Better-Auth integration with Drizzle adapter
   - Email/password authentication
   - Admin plugin with role-based access
   - User profile management with bio field
   - Session management with security features

3. **Database Infrastructure**
   - Complete schema for blog and chat features
   - Database migrations setup
   - Drizzle ORM configuration
   - Docker Compose for local PostgreSQL

4. **Blog System API**
   - Blog CRUD operations
   - Search and filtering capabilities
   - Pagination support
   - Tag management system
   - Comment system (schema ready)

5. **Frontend Foundation**
   - React application with TanStack Router
   - Responsive UI with TailwindCSS
   - Dark/light theme support
   - PWA configuration
   - Component library (shadcn/ui)

### 🔄 Partially Implemented
1. **Admin Interface**
   - Basic admin routes defined
   - Admin authentication ready
   - Blog management endpoints partially implemented

2. **Frontend Blog Interface**
   - Basic routing structure
   - Component framework ready
   - Blog listing and detail views needed

### ❌ Not Yet Implemented

1. **Chat System API**
   - Message CRUD endpoints
   - Room management API
   - Real-time WebSocket integration
   - File upload for message attachments

2. **Chat Frontend**
   - Chat room interface
   - Message composer and display
   - Room list and navigation
   - Real-time message updates

3. **Real-time Infrastructure**
   - WebSocket server setup
   - Message broadcasting
   - Typing indicators
   - Online presence tracking

4. **Advanced Features**
   - File sharing in messages
   - Message reactions and replies
   - Push notifications
   - Message search functionality

## Development Workflow

### Getting Started
```bash
# Install dependencies
bun install

# Start PostgreSQL (Docker)
bun db:start

# Push database schema
bun db:push

# Start development servers
bun dev
```

### Available Scripts
```bash
# Development
bun dev              # Start all apps
bun dev:web         # Frontend only (port 3001)
bun dev:server      # Backend only (port 3000)

# Database
bun db:push         # Apply schema changes
bun db:studio       # Open Drizzle Studio
bun db:generate     # Generate migration files
bun db:migrate      # Run migrations

# Build & Quality
bun build           # Build all apps
bun check-types     # TypeScript verification
bun check           # Oxlint linting
```

### Environment Setup

#### Server Environment (`apps/server/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/vynchat
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
```

#### Web Environment (`apps/web/.env`)
```env
VITE_SERVER_URL=http://localhost:3000
```

## API Architecture

### Current Endpoints (`apps/server/src/routers/`)
- **Health Check**: `GET /healthCheck`
- **Blog Routes**: Blog CRUD operations
- **Tag Routes**: Tag management
- **Admin Routes**: Administrative functions

### API Patterns
- **oRPC Integration**: Type-safe client-server communication
- **Zod Validation**: Input/output schema validation
- **Error Handling**: Consistent error responses
- **OpenAPI**: Automatic API documentation generation

## Frontend Architecture

### Routing (`apps/web/src/routes/`)
- **File-based Routing**: TanStack Router convention
- **Type Safety**: Full route type inference
- **Layout System**: Nested route layouts
- **Error Boundaries**: Graceful error handling

### Component Structure
- **UI Components**: Reusable shadcn/ui components
- **Business Components**: Feature-specific components
- **Layout Components**: Headers, navigation, themes
- **Form Components**: Authentication forms

### State Management
- **TanStack Query**: Server state management
- **oRPC Client**: Type-safe API calls
- **Local State**: React hooks for UI state

## Security Considerations

### Authentication & Authorization
- **Secure Cookies**: HttpOnly, Secure, SameSite settings
- **Session Management**: Automatic token refresh
- **Role-based Access**: Admin, user, guest roles
- **CORS Configuration**: Restricted origins

### Database Security
- **Parameterized Queries**: SQL injection prevention
- **User Banning**: Temporary and permanent bans
- **Data Validation**: Zod schema enforcement
- **Cascade Deletes**: Proper data cleanup

## Performance Optimizations

### Database
- **Strategic Indexing**: Query performance optimization
- **Connection Pooling**: Drizzle ORM built-in pooling
- **Query Optimization**: Efficient relationship loading

### Frontend
- **Code Splitting**: Automatic route-based splitting
- **Bundle Optimization**: Vite build optimizations
- **PWA Caching**: Service worker caching strategies

### Backend
- **Turborepo Caching**: Build result caching
- **Bun Runtime**: Fast JavaScript runtime
- **Hono Framework**: Minimal overhead web framework

## Critical Next Steps

### High Priority
1. **Implement Chat API Endpoints**
   - Message CRUD operations
   - Room management endpoints
   - User permission handling

2. **WebSocket Integration**
   - Real-time message broadcasting
   - Connection management
   - Error handling and reconnection

3. **Chat Frontend Components**
   - Message list and input components
   - Room navigation and management
   - Real-time UI updates

### Medium Priority
1. **Complete Blog Interface**
   - Blog listing and detail pages
   - Admin blog management UI
   - Comment system interface

2. **Enhanced Security**
   - Rate limiting implementation
   - Input sanitization
   - CSRF protection

3. **Testing Infrastructure**
   - Unit tests for API endpoints
   - Integration tests for auth flow
   - E2E tests for critical paths

### Future Enhancements
1. **Advanced Chat Features**
   - File sharing and image uploads
   - Message reactions and replies
   - Thread conversations

2. **Mobile Optimization**
   - PWA enhancements
   - Touch-friendly interface
   - Offline functionality

3. **Scalability Improvements**
   - Database sharding strategy
   - CDN integration
   - Microservice architecture

## Common Pitfalls & Solutions

### Database Issues
- **Migration Conflicts**: Always run `bun db:push` after schema changes
- **Connection Limits**: Monitor PostgreSQL connections in development
- **Index Performance**: Add indexes for frequently queried columns

### Development Issues
- **Type Errors**: Regenerate oRPC types after API changes
- **CORS Issues**: Verify CORS_ORIGIN environment variable
- **Port Conflicts**: Check for applications using ports 3000/3001

### Deployment Considerations
- **Environment Variables**: Secure secret management
- **Database Migrations**: Production migration strategy
- **Build Optimization**: Bundle size monitoring

## Resources & Documentation

### Project Documentation
- **Better-T-Stack**: [GitHub Repository](https://github.com/AmanVarshney01/create-better-t-stack)
- **Tech Stack Docs**: Individual framework documentation links in package.json

### Development Tools
- **Drizzle Studio**: `bun db:studio` for database management
- **oRPC DevTools**: API endpoint testing and documentation
- **React DevTools**: Component debugging and profiling

### External Dependencies
- **Database**: PostgreSQL 14+ recommended
- **Node.js**: Bun runtime (latest stable)
- **Docker**: For local database container

## Contact & Support

This handover document should be updated as the project evolves. Key areas requiring immediate attention are marked with ❌ status indicators. The foundation is solid - focus on implementing the chat system to realize the project's core vision.

For technical questions, refer to the framework documentation and the existing code patterns established in the blog system implementation.

