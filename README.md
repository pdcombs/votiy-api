# Votiy API

A robust REST API for the Votiy event voting platform, built with Node.js, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation
```bash
# Clone the repository
git clone https://github.com/pdcombs/votiy-api.git
cd votiy-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
# JWT_SECRET=your_jwt_secret

# Start the server
npm run dev
```

The API will be available at `http://localhost:3001`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Getting a Token
1. **Sign Up**: `POST /api/auth/signup`
2. **Sign In**: `POST /api/auth/signin`

### Using the Token
Include the token in your request headers:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## 📚 API Endpoints

### Health Check
- **GET** `/health` - Server health status
- **GET** `/debug/supabase` - Test Supabase connection

### Authentication (`/api/auth`)

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "created_at": "2025-01-02T01:34:39.969Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Sign Out
```http
POST /api/auth/signout
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

### Users (`/api/users`)

#### Get All Users
```http
GET /api/users
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create User
```http
POST /api/users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1987654321"
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "first_name": "Updated Name",
  "phone": "+1111111111"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Polls (`/api/polls`)

#### Get All Polls
```http
GET /api/polls
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Poll by ID
```http
GET /api/polls/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Poll
```http
POST /api/polls
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Favorite Programming Language",
  "description": "Vote for your favorite programming language",
  "short_code": "12345",
  "start_date_time": "2025-01-15T10:00:00Z",
  "end_date_time": "2025-01-20T18:00:00Z"
}
```

#### Update Poll
```http
PUT /api/polls/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Poll Title",
  "end_date_time": "2025-01-25T18:00:00Z"
}
```

#### Delete Poll
```http
DELETE /api/polls/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Poll Options (`/api/poll-options`)

#### Get All Poll Options
```http
GET /api/poll-options
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Poll Options by Poll ID
```http
GET /api/poll-options?poll_id=:poll_id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Poll Option
```http
POST /api/poll-options
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "poll_id": "poll_uuid",
  "section_id": "section_uuid",
  "title": "JavaScript"
}
```

#### Update Poll Option
```http
PUT /api/poll-options/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Option Title"
}
```

#### Delete Poll Option
```http
DELETE /api/poll-options/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Poll Votes (`/api/poll-votes`)

#### Get All Votes
```http
GET /api/poll-votes
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Votes by Poll ID
```http
GET /api/poll-votes?poll_id=:poll_id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Cast a Vote
```http
POST /api/poll-votes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "poll_id": "poll_uuid",
  "poll_option_id": "option_uuid"
}
```

#### Update Vote
```http
PUT /api/poll-votes/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "poll_option_id": "new_option_uuid"
}
```

#### Delete Vote
```http
DELETE /api/poll-votes/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing with Postman

### 1. Set Up Environment Variables
Create a new environment in Postman and add these variables:
- `base_url`: `http://localhost:3001`
- `auth_token`: (leave empty, will be set after login)

### 2. Authentication Flow
1. **Sign Up**: `POST {{base_url}}/api/auth/signup`
2. **Sign In**: `POST {{base_url}}/api/auth/signin`
3. **Copy Token**: From the response, copy the `token` value
4. **Set Token**: In your environment, set `auth_token` to the copied token

### 3. Test Protected Endpoints
Use `{{auth_token}}` in the Authorization header:
```
Authorization: Bearer {{auth_token}}
```

### 4. Postman Collection
Import this collection structure:

```json
{
  "info": {
    "name": "Votiy API",
    "description": "Complete API collection for Votiy"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/health"
      }
    },
    {
      "name": "Auth",
      "item": [
        {
          "name": "Sign Up",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/signup",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"first_name\": \"Test\",\n  \"last_name\": \"User\"\n}"
            }
          }
        },
        {
          "name": "Sign In",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/auth/signin",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  phone text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  password_hash text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

### Polls Table
```sql
CREATE TABLE public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  short_code text UNIQUE NOT NULL,
  start_date_time timestamp with time zone,
  end_date_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.users(id),
  CONSTRAINT polls_pkey PRIMARY KEY (id)
);
```

### Poll Sections Table
```sql
CREATE TABLE public.poll_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT poll_sections_pkey PRIMARY KEY (id)
);
```

### Poll Options Table
```sql
CREATE TABLE public.poll_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.poll_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT poll_options_pkey PRIMARY KEY (id)
);
```

### Poll Votes Table
```sql
CREATE TABLE public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  poll_option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
  UNIQUE(poll_id, user_id)
);
```

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

### Production
```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Start the server
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details if available"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy Voting! 🗳️**
