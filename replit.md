# Overview

This is a social media management application built as an AI-powered platform that integrates with the Ayrshare API. The application allows users to manage multiple social media accounts, schedule posts, view analytics, handle messages and comments, and connect various social platforms through a unified interface. The system is designed as a full-stack web application with a React frontend and Express.js backend, using PostgreSQL for data persistence and the Ayrshare API for social media operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture. The application uses Vite as the build tool and development server. Key architectural decisions include:

- **Component Library**: Utilizes shadcn/ui components built on top of Radix UI primitives for consistent and accessible UI components
- **Styling**: Implements Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: Uses TanStack Query (React Query) for server state management and caching, avoiding the need for complex global state management
- **Routing**: Implements wouter for lightweight client-side routing
- **Form Handling**: Uses React Hook Form with Zod validation for type-safe form management
- **Responsive Design**: Mobile-first approach with adaptive layouts using sidebar navigation for desktop and bottom navigation for mobile

## Backend Architecture
The backend follows a RESTful API design using Express.js with TypeScript. The architecture emphasizes:

- **Database Layer**: Uses Drizzle ORM for type-safe database operations with PostgreSQL
- **Service Layer**: Implements an Ayrshare client service for external API integration
- **Storage Layer**: Abstracts database operations through a storage interface for better maintainability
- **Route Handling**: Organized route handlers for different API endpoints (users, posts, messages, comments, analytics)
- **Error Handling**: Centralized error handling middleware for consistent error responses

## Data Storage Solutions
The application uses PostgreSQL as the primary database with the following schema design:

- **Users Table**: Stores user authentication data and Ayrshare API keys
- **Social Accounts Table**: Manages connected social media platform accounts with platform-specific metadata
- **Posts Table**: Handles post content, scheduling, and multi-platform publishing status
- **Messages Table**: Stores direct messages and conversations from social platforms
- **Comments Table**: Manages comments and engagement data from social posts
- **Analytics Table**: Tracks performance metrics and engagement data

## Authentication and Authorization
The system implements a simple authentication mechanism using:

- **User Management**: Basic user registration and API key management
- **API Key Storage**: Securely stores Ayrshare API keys for each user
- **Session Handling**: Uses session-based authentication with PostgreSQL session storage

## External Service Integrations
The application heavily relies on external services for core functionality:

- **Ayrshare API**: Primary integration for social media operations including posting, analytics, messaging, and account management
- **Platform Support**: Supports multiple social media platforms (Twitter, Instagram, Facebook, LinkedIn, YouTube, TikTok, Reddit, Google Business Profile)
- **Media Handling**: Supports image and video uploads through media URLs
- **Scheduling**: Implements post scheduling through Ayrshare's scheduling capabilities

# External Dependencies

## Core Framework Dependencies
- **React**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: PostgreSQL database service integration
- **Vite**: Frontend build tool and development server

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **date-fns**: Date manipulation utilities

## Social Media Integration
- **Ayrshare API**: Primary social media management service
- **Supported Platforms**: Twitter/X, Instagram, Facebook, LinkedIn, YouTube, TikTok, Reddit, Google Business Profile

## Development Tools
- **TypeScript**: Type safety across the application
- **PostCSS**: CSS processing
- **ESBuild**: Fast JavaScript bundling for production