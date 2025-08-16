# Overview

This is a RIASEC (Holland Code) career assessment and major recommendation system specifically designed for Korean university students. The application helps students discover their personality types and provides personalized recommendations for academic majors within a Creative Convergence Department. The system combines personality assessment, AI-powered career guidance, Pinecone vector database for similar case studies, Rasa-like conversation management, and an interactive chat interface to provide comprehensive academic counseling.

## Recent Changes (January 2025)
- **Added User Authentication System**: Student ID-based registration (9-digit validation) with secure login/logout
- **Added Satisfaction Survey System**: Comprehensive feedback collection integrated with Pinecone for case studies
- **Enhanced Database Architecture**: PostgreSQL with users, satisfaction_surveys tables and proper foreign key relationships
- **Added Pinecone Vector Database Integration**: Implemented vector storage and similarity search for case studies
- **Added Rasa-like Conversation Management**: Enhanced chat with intent classification and entity extraction  
- **Enhanced Assessment Results**: Now includes feedback from similar cases based on user's RIASEC profile
- **Improved Chat Intelligence**: Structured conversation flow with slot management and action determination
- **Corrected Institutional Information**: Clarified that 컴퓨터융합학부 is the renamed 컴퓨터공학과 under 공과대학, separate from 창의융합대학
- **Implemented GPT-based Data Integrity Validation**: Added comprehensive AI-powered validation system for RIASEC assessments, satisfaction surveys, and user data with real-time feedback to users
- **Enhanced Natural Chat Experience**: Upgraded chat system with context-aware conversations, personality-based responses, and human-like counseling approach for better user engagement
- **Implemented Chat Security and Conversation Enhancement**: Added rate limiting, content filtering, and conversation depth analysis to prevent abuse while encouraging rich discussions
- **Removed Guest Experience and Bookmark Features**: Streamlined user experience by removing guest trial functionality and bookmark system
- **Completely Removed Guest Trial Buttons**: Deleted "비회원으로 체험하기" buttons from login and registration pages for cleaner interface
- **Enhanced Profile Satisfaction Survey Access**: Added prominent satisfaction survey button in user profile for better accessibility  
- **Fixed RIASEC Assessment Navigation Bug**: Corrected issue where assessment page wouldn't proceed after initial selection
- **Minimized Data Validation**: Replaced GPT-based validation with basic range checks for faster processing
- **Improved RIASEC Chart Visualization**: Enlarged chart from h-80 to h-96 for better readability
- **Fixed Dialog Accessibility Issues**: Added proper DialogTitle and DialogDescription for screen reader compatibility
- **Enhanced RIASEC Score UX**: Removed default 0 values, added flexible max score input (default 100), automatic score standardization
- **Significantly Enlarged Chart Display**: Increased chart size to h-[calc(100vh-200px)] with full-width layout covering entire viewport
- **Enhanced Chart Visual Elements**: Maximized point radius (16px), labels (24px), border width (6px), and grid lines (3px) for maximum clarity and visibility
- **Added Dynamic Analysis Loading**: Implemented step-by-step loading animation with progress indicators during AI analysis
- **Improved Chat Intelligence**: Enhanced natural chat service to interpret most questions as major recommendation requests, making the chatbot more helpful and focused on academic counseling

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Routing**: wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Design System**: Custom Korean-focused design with neutral color palette and accessible components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for assessment, chat, and recommendation services
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations with foreign key relationships
- **Database**: PostgreSQL with Neon serverless hosting for production scalability
- **Schema**: Comprehensive tables for users (with student ID), assessments, chat sessions, and satisfaction surveys
- **Data Integrity**: Proper foreign key constraints and user-scoped data access patterns

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store and bcrypt password hashing
- **User Registration**: Student ID-based system with 9-digit validation (YYYY + 5-digit sequence)
- **Secure Authentication**: Username/password login with session persistence and user isolation
- **Data Isolation**: User-scoped data access patterns with proper foreign key relationships

## External Dependencies

### AI and Machine Learning
- **OpenAI GPT-4o**: Powers RIASEC personality analysis and major recommendations
- **Assessment Engine**: Custom logic for analyzing user responses and calculating personality scores
- **Chat Intelligence**: Context-aware conversational AI for academic counseling
- **Pinecone Vector Database**: Stores and retrieves similar case studies for enhanced recommendations
- **Rasa-like Conversation Management**: Intent classification, entity extraction, and conversation flow management

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle Kit**: Database migration and schema management tools
- **Session Storage**: Persistent session management with PostgreSQL backend

### UI and Design System
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Consistent icon system throughout the application
- **shadcn/ui**: Pre-built component library with customizable styling

### Development and Build Tools
- **Vite**: Fast development server and optimized production builds
- **ESBuild**: High-performance JavaScript bundling for server-side code
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **Replit Integration**: Development environment optimizations and error handling

### Form and Data Handling
- **React Hook Form**: Efficient form state management with validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities
- **Embla Carousel**: Touch-friendly carousel components for assessment flow

The system emphasizes user experience with a mobile-responsive design, real-time chat capabilities, and personalized assessment results that help Korean students make informed decisions about their academic future.