# Votiy API

A Node.js/Express API backend for the Votiy poll voting platform, integrated with Supabase.

## Features
- User Authentication with JWT
- Event Management
- Voting System
- User Profiles
- Security with Rate Limiting

## Setup
1. Install dependencies: `npm install`
2. Copy `env.example` to `.env` and configure
3. Set up Supabase database with `database-schema.sql`
4. Run: `npm run dev`

## API Endpoints
- `/api/auth` - Authentication
- `/api/polls` - Poll management
- `/api/users` - User management

## Environment Variables
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET, PORT, CORS_ORIGIN
