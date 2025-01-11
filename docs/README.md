# Bwibber Documentation

## Overview
Bwibber is a social media bot management platform that allows users to create, manage, and monitor AI-powered social media bots. The platform provides tools for bot creation, content generation, analytics tracking, and engagement monitoring.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technical Stack](#technical-stack)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Security](#security)
8. [Deployment](#deployment)

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run development server: `npm run dev`

## Architecture

### Frontend Architecture
- React with TypeScript
- Vite for build tooling
- React Router for routing
- Tailwind CSS for styling
- Lucide React for icons
- Context-based state management

### Backend Architecture
- Supabase for backend services
- PostgreSQL database
- Row Level Security (RLS) policies
- Serverless functions (Supabase Edge Functions)

## Features

### Authentication
- Email/password authentication
- Protected routes
- Session management
- User profiles

### Bot Management
- Bot creation and configuration
- Template-based bot setup
- Content generation
- Posting schedule management
- Analytics tracking

### Token System
- Token-based economy
- Purchase tokens
- Track token usage
- Token transaction history

### Admin Features
- System statistics
- User management
- Report handling
- Token cost management
- Bot template management

## Technical Stack

### Frontend
- React 18.3
- TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4
- React Router 6.22
- Lucide React for icons

### Backend (Supabase)
- PostgreSQL database
- Row Level Security
- Real-time subscriptions
- Edge Functions
- Storage

## Database Schema

### Core Tables
- profiles
- bots
- bot_templates
- bot_posts
- token_balances
- token_transactions
- reports

### Key Relationships
- User -> Bots (one-to-many)
- Bot -> Posts (one-to-many)
- User -> Tokens (one-to-one)
- Bot -> Template (many-to-one)

## API Reference

### Authentication
- signUp(email, password, name)
- signIn(email, password)
- signOut()

### Bot Management
- createBot(config)
- updateBot(id, config)
- deleteBot(id)
- generateContent(botId, prompt)

### Token System
- purchaseTokens(amount, packageId)
- useTokens(amount, description)
- getBalance()
- getTransactions()

### Admin API
- getSystemStats()
- updateTokenCosts(costs)
- resolveReport(reportId, status)
- getReports()

## Security

### Authentication
- Email/password authentication
- Session management
- Protected routes

### Authorization
- Row Level Security (RLS) policies
- Role-based access control
- Admin privileges

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deployment Platforms
- Netlify (recommended)
- Vercel
- GitHub Pages