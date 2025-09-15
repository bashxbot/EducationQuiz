# Overview

This is a comprehensive educational application built with React, Express, and PostgreSQL that provides interactive learning through AI-powered chat, quizzes, and reasoning challenges. The app combines modern web technologies with AI capabilities to create an engaging learning platform for students.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript and Vite for fast development and building
- **UI Framework**: Uses shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and consistent design system
- **State Management**: React Query for server state management and local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Structure**: Modular route handlers for different features (chat, quiz, reasoning, user management)
- **Development Setup**: Hot reload with Vite integration for seamless development experience

## Core Features
- **AI Chat System**: Interactive educational chat powered by Google's Gemini AI with streaming responses
- **Quiz System**: Dynamic quiz generation with multiple subjects, difficulty levels, and instant feedback
- **Reasoning Challenges**: Logic puzzles and analytical problems for critical thinking development
- **Progress Tracking**: User progress monitoring with points, streaks, and achievement systems
- **Leaderboards**: Competitive elements to encourage engagement

## Data Storage
- **PostgreSQL Database**: Primary data storage using Neon serverless PostgreSQL
- **Schema Design**: Well-structured tables for users, chat messages, quizzes, reasoning challenges, and progress tracking
- **Local Storage**: Client-side storage for user preferences and temporary data
- **Session Management**: Server-side session handling for user authentication

## Authentication & Authorization
- **User Management**: User registration and authentication system
- **Session-Based Auth**: Express sessions with PostgreSQL store for persistence
- **Protected Routes**: Route-level protection for authenticated features

# External Dependencies

## AI Services
- **Google Gemini AI**: Core AI service for chat responses, quiz generation, and reasoning challenge creation
- **LaTeX Rendering**: KaTeX for mathematical expression rendering in educational content

## Database & Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database for scalable data storage
- **Drizzle Kit**: Database migration and schema management tools

## UI & Styling
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide Icons**: Comprehensive icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **React Query**: Server state management and caching
- **Replit Integration**: Development environment optimizations for Replit platform