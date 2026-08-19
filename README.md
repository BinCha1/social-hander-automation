# Social Content Automation API

A FastAPI-based backend service for managing and automating social media content across multiple platforms. Integrates with **n8n** for workflow automation and **Discord** for approval workflows.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [File-by-File Explanation](#file-by-file-explanation)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Inspecting PostgreSQL Data](#inspecting-postgresql-data)
- [Security Features](#security-features)

---

## Overview

This API enables users to:

1. **Register and authenticate** via JWT-based auth
2. **Manage business profiles** (brand info, tone, audience, industry)
3. **Connect social media accounts** (Facebook, Instagram, LinkedIn, Threads)
4. **Create content requests** with topics, platforms, goals, and media preferences
5. **Trigger n8n workflows** for automated content generation
6. **Approve content via Discord** - generated content is sent to Discord for review
7. **Publish approved content** to social platforms

---

## Tech Stack

| Component | Technology |
|-----------|-------------|
| Framework | FastAPI (Python 3.13+) |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (HS256), OAuth2PasswordBearer |
| Password Hashing | Argon2 via pwdlib |
| Credential Encryption | Fernet (AES-128-CBC) |
| HTTP Client | httpx (async) |
| Workflow Automation | n8n (webhooks) |
| Discord Integration | Discord Bot API v10 |
| Reverse Proxy | Caddy |
| Tunneling | ngrok |
| Testing | pytest |

---

## Project Structure

```
.
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── dependencies.py            # Shared dependency injectors (auth, actor resolution)
│   ├── core/
│   │   ├── config.py              # Pydantic settings from environment variables
│   │   ├── security.py           # JWT, password hashing, encryption, webhook verification
│   │   └── database.py            # SQLAlchemy engine, session, Base
│   ├── models/
│   │   ├── __init__.py            # Model exports
│   │   ├── user.py                # User model (authentication)
│   │   ├── business.py            # Business profile model
│   │   ├── content.py             # Content request model
│   │   ├── social_account.py      # Social platform credentials model
│   │   └── discord_config.py      # Discord bot configuration model
│   ├── routers/
│   │   ├── __init__.py            # Router exports
│   │   ├── auth.py                # /api/v1/auth - registration, login
│   │   ├── business.py            # /api/v1/business - business profile CRUD
│   │   ├── content.py             # /api/v1/content - content management + n8n trigger
│   │   ├── credentials.py         # /api/v1/credentials - social account management
│   │   ├── discord.py             # /api/integrations/discord - bot config + interactions
│   │   └── health.py              # /health - health check
│   └── schemas/
│       ├── __init__.py            # Schema exports
│       ├── auth.py                # UserRegister, Token, UserResponse
│       ├── business.py            # BusinessProfileCreate/Update/Response
│       ├── content.py             # ContentCreate/Update/Response + automation payload
│       ├── credentials.py         # SocialAccountCreate/Update/Response
│       └── discord.py             # DiscordConfigCreate, Interaction callbacks
├── tests/
│   ├── conftest.py                # Pytest fixtures and test database setup
│   ├── test_auth.py               # Authentication tests
│   ├── test_content.py            # Content creation and n8n integration tests
│   ├── test_credentials.py       # Social account CRUD tests
│   ├── test_discord.py            # Discord integration and approval workflow tests
│   └── test_n8n.py                # n8n webhook authentication tests
├── docker-compose.yml             # Docker services (postgres, n8n, caddy, ngrok)
├── Caddyfile                     # Caddy reverse proxy configuration
├── pyproject.toml                # Python project dependencies
├── .env.example                  # Example environment variables
├── .env                          # Environment variables (not committed)
└── README.md                     # This file

---

## File-by-File Explanation

### `app/main.py`
**Purpose:** FastAPI application entry point. Includes all routers, CORS middleware, and lifespan events.
```python
# Registers routers: auth, business, content, credentials, discord, health
# Includes CORS middleware for all origins
```

### `app/dependencies.py`
**Purpose:** Shared FastAPI dependencies for authentication and authorization.
```python
# get_current_active_user - JWT token validation, returns User
# get_request_actor - Resolves either User (JWT) or "n8n" (webhook secret)
# verify_n8n_secret - Validates X-N8N-Webhook-Secret header
```

### `app/core/config.py`
**Purpose:** Pydantic Settings class that reads environment variables.
```python
# Reads from .env file
# Critical: DATABASE_URL, SECRET_KEY must be set
# n8n settings: N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, N8N_SCHEDULE_WEBHOOK_URL
# discord settings: DISCORD_PUBLIC_KEY
# cloudinary settings: CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET
```

### `app/core/security.py`
**Purpose:** Security utilities - JWT encoding/decoding, password hashing, Fernet encryption, webhook verification.
```python
# create_access_token() - Creates JWT with username and expiry
# decode_access_token() - Validates and decodes JWT
# hash_password() - Argon2 password hashing
# verify_password() - Timing-safe password verification
# encrypt_credential() / decrypt_credential() - Fernet symmetric encryption
# verify_n8n_secret() - HMAC comparison for webhook auth
# verify_discord_signature() - Ed25519 signature verification for Discord interactions
```

### `app/core/database.py`
**Purpose:** SQLAlchemy database engine and session management.
```python
# engine - PostgreSQL engine with connection pooling
# get_db - Dependency that yields database session
# Base - Declarative base for all models
```

### `app/models/user.py`
**Purpose:** User model for authentication.
```python
# Table: users
# Fields: id (UUID), username, email, full_name, hashed_password, is_active, timestamps
# Unique constraints on username and email
```

### `app/models/business.py`
**Purpose:** Business profile model - one per user.
```python
# Table: businesses
# Fields: id, user_id (FK), name, type, about, products, website,
#         target_audience, brand_tone, industry, brand_style, timestamps
# Unique constraint on user_id (one business per user)
```

### `app/models/content.py`
**Purpose:** Content request model for social media posts.
```python
# Table: social_contents
# Fields: id, user_id (FK), business_id (FK), topic, platforms (JSON),
#         goal, cta, user_prompt, preferred_media, user_image_url, user_video_url,
#         media_instructions, mode (instant/schedule), publish_date, publish_time,
#         status, feedback, approval_resume_url, n8n_status_code, n8n_response, last_error
# status values: pending, processing, done, failed
```

### `app/models/social_account.py`
**Purpose:** Social media account credentials - encrypted storage.
```python
# Table: social_accounts
# Fields: id, user_id (FK), platform, account_name, account_id,
#         encrypted_access_token, encrypted_refresh_token, is_active, timestamps
# Unique constraint on (user_id, platform)
# Supported platforms: facebook, instagram, linkedin, threads
```

### `app/models/discord_config.py`
**Purpose:** Discord bot configuration - encrypted bot token.
```python
# Table: discord_configs
# Fields: id, user_id (FK, unique), encrypted_bot_token, bot_name, public_key,
#         application_id, channel_id, connection_status, last_error, is_active, timestamps
```

### `app/routers/auth.py`
**Purpose:** Authentication endpoints - registration and login.
```python
# POST /api/v1/auth/register - Create new user, returns JWT
# POST /api/v1/token - Login with username/password, returns JWT (OAuth2PasswordRequestForm)
# GET /api/v1/auth/users/me - Get current user profile (requires JWT)
```

### `app/routers/business.py`
**Purpose:** Business profile CRUD operations.
```python
# GET /api/v1/business/profile - Get current user's business profile
# POST /api/v1/business/profile - Create or update business profile
# PUT /api/v1/business/profile - Full update business profile
# DELETE /api/v1/business/profile - Delete business profile
```

### `app/routers/content.py`
**Purpose:** Content creation, management, and n8n webhook triggering.
```python
# GET /api/v1/content - List user's content (supports ?status= and ?mode= filters)
# POST /api/v1/content - Create content (triggers n8n webhook if mode=instant)
# GET /api/v1/content/{content_id} - Get specific content item
# PUT /api/v1/content/{content_id} - Update content
# PATCH /api/v1/content/{content_id} - Update content status only
# DELETE /api/v1/content/{content_id} - Delete content
# PUT /api/v1/content/{content_id}/approval-resume - Register n8n resume URL for approvals

# Key functions:
# _resolve_credentials() - Decrypts and resolves social platform tokens + discord bot token
# _build_payload() - Constructs n8n webhook payload with business, content, media, credentials
# _trigger_webhook() - POSTs to n8n webhook URL with X-N8N-Webhook-Secret header
```

### `app/routers/credentials.py`
**Purpose:** Social media account connection management.
```python
# GET /api/v1/credentials - List all connected social accounts
# GET /api/v1/credentials/{platform} - Get specific platform credential
# POST /api/v1/credentials - Connect new social account
# PUT /api/v1/credentials/{platform} - Update account credentials
# DELETE /api/v1/credentials/{platform} - Disconnect account
```

### `app/routers/discord.py`
**Purpose:** Discord bot configuration and interaction handling.
```python
# GET /api/integrations/discord/config - Get Discord bot config
# POST /api/integrations/discord/config - Create/update bot config (validates token)
# PUT /api/integrations/discord/config - Update bot config
# DELETE /api/integrations/discord/config - Delete bot config
# POST /api/integrations/discord/approval-message - Send approval message to Discord (n8n caller)
# POST /api/integrations/discord/interactions - Handle Discord button clicks (approve/decline)

# Key functions:
# _validate_discord_token() - Fetches bot info from Discord API to validate token
# _notify_n8n_approval() - POSTs approval result to n8n resume URL
```

### `app/routers/health.py`
**Purpose:** Health check endpoint.
```python
# GET /health - Returns {"status": "ok"}
```

### `app/schemas/` (Pydantic Models)
**Purpose:** Request/Response validation and serialization.

| File | Purpose |
|------|---------|
| `auth.py` | UserRegister, Token, UserResponse schemas |
| `business.py` | BusinessProfileCreate, Update, Response schemas |
| `content.py` | ContentCreate, Update, StatusUpdate, Response schemas |
| `credentials.py` | SocialAccountCreate, Update, Response schemas + SUPPORTED_PLATFORMS tuple |
| `discord.py` | DiscordConfigCreate, InteractionCreate, ApprovalMessageCreate schemas |

---

## Database Schema

### Entity Relationship Diagram

```
users (1) ----< (1) businesses
  |                |
  |                |
  v                v
users (1) ----< (N) social_contents
  |
  |
  v
users (1) ----< (1) discord_configs
  |
  |
  v
users (N) ----< (N) social_accounts
```

**Tables:** users, businesses, social_contents, social_accounts, discord_configs

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Health check |

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | None | Register new user |
| POST | `/api/v1/token` | Form | Login (OAuth2PasswordRequestForm) |
| GET | `/api/v1/auth/users/me` | JWT | Get current user |

### Business Profile (`/api/v1/business`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/business/profile` | JWT | Get business profile |
| POST | `/api/v1/business/profile` | JWT | Create/update profile |
| PUT | `/api/v1/business/profile` | JWT | Full update profile |
| DELETE | `/api/v1/business/profile` | JWT | Delete profile |

### Social Credentials (`/api/v1/credentials`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/credentials` | JWT | List all accounts |
| GET | `/api/v1/credentials/{platform}` | JWT | Get platform account |
| POST | `/api/v1/credentials` | JWT | Connect account |
| PUT | `/api/v1/credentials/{platform}` | JWT | Update account |
| DELETE | `/api/v1/credentials/{platform}` | JWT | Disconnect account |

**Supported Platforms:** `facebook`, `instagram`, `linkedin`, `threads`

### Content Management (`/api/v1/content`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/content` | JWT | List content |
| POST | `/api/v1/content` | JWT | Create content |
| GET | `/api/v1/content/{content_id}` | JWT/n8n | Get content |
| PUT | `/api/v1/content/{content_id}` | JWT | Update content |
| PATCH | `/api/v1/content/{content_id}` | JWT/n8n | Update status |
| DELETE | `/api/v1/content/{content_id}` | JWT | Delete content |
| PUT | `/api/v1/content/{content_id}/approval-resume` | JWT/n8n | Register resume URL |

### Discord Integration (`/api/integrations/discord`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/integrations/discord/config` | JWT | Get bot config |
| POST | `/api/integrations/discord/config` | JWT | Create/update config |
| PUT | `/api/integrations/discord/config` | JWT | Update config |
| DELETE | `/api/integrations/discord/config` | JWT | Delete config |
| POST | `/api/integrations/discord/approval-message` | n8n | Send approval message |
| POST | `/api/integrations/discord/interactions` | Discord Sig | Handle button clicks |

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# PostgreSQL (docker-compose)
POSTGRES_USER=socialhandler
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=socialhandler

# Database connection
DATABASE_URL=postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5434/${POSTGRES_DB}

# JWT Authentication (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60

# n8n Webhook Integration
N8N_WEBHOOK_SECRET=your-n8n-webhook-secret
N8N_WEBHOOK_URL=https://your-ngrok-url/webhook-test/workflow-id
N8N_SCHEDULE_WEBHOOK_URL=https://your-ngrok-url/webhook/schedule-workflow-id
N8N_APPROVAL_WEBHOOK_URL=https://your-ngrok-url/webhook/approval-workflow-id

# Discord Integration (from Discord Developer Portal)
DISCORD_PUBLIC_KEY=your-discord-public-key

# Cloudinary (optional - for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# n8n UI Configuration (for docker-compose)
N8N_WEBHOOK_URL_UI=https://your-ngrok-url

# ngrok
NGROK_AUTHTOKEN=your-ngrok-authtoken
```

**Note:** Never commit `.env` to version control. It contains sensitive credentials.

---

## Credentials Setup Guide

This guide walks through creating all required credentials for the project.

### 1. PostgreSQL

**Purpose:** Primary database for storing users, content, and credentials.

**Setup:** PostgreSQL runs via Docker Compose - no external account needed.

**Generated Values:**
- `POSTGRES_USER`: Use `socialhandler`
- `POSTGRES_PASSWORD`: Create a strong password (min 16 chars)
- `POSTGRES_DB`: Use `socialhandler`

---

### 2. JWT Secret Key

**Purpose:** Secures JWT tokens for authentication.

**Generate:**
```bash
openssl rand -hex 32
```

**Set in `.env`:**
```env
SECRET_KEY=<generated-value>
```

---

### 3. ngrok

**Purpose:** Creates public URLs for Discord to send webhook events to n8n.

**Setup:**
1. Go to https://ngrok.com
2. Sign up for free account
3. Navigate to **Getting Started → Your Authtoken**
4. Copy your auth token

**Set in `.env`:**
```env
NGROK_AUTHTOKEN=<your-token>
```

**Note:** The free tier allows 1 tunnel at a time. The project is configured with a specific subdomain - contact the maintainer for the existing token or set up your own.

---

### 4. Discord Developer Portal

**Purpose:** Discord bot for sending content approval messages to users.

**Setup:**

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name it (e.g., "PostFlow Bot")
3. Go to **General Information**:
   - Copy **Application ID**
   - Copy **Public Key** → Set as `DISCORD_PUBLIC_KEY` in `.env`
4. Go to **Bot**:
   - Click **Reset Token** → Copy token → Set as `DISCORD_BOT_TOKEN` in frontend/`.env`
   - Enable these **Privileged Gateway Intents**:
     - ✅ MESSAGE CONTENT INTENT
     - ✅ PRESENCE INTENT
     - ✅ SERVER MEMBERS INTENT
5. Go to **OAuth2 → URL Generator**:
   - Check scopes: `bot`, `applications.commands`
   - Check permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Copy generated URL and invite bot to your Discord server

**Set in `.env` (frontend):**
```env
DISCORD_BOT_TOKEN=<your-bot-token>
```

**Set in `.env` (root):**
```env
DISCORD_PUBLIC_KEY=<your-public-key>
```

---

### 5. Meta Business (Facebook & Instagram)

**Purpose:** Post content to Facebook Pages and Instagram accounts.

**Setup:**

1. Go to https://developers.facebook.com
2. Click **My Apps** → **Create App** → Select **Business** type
3. Add **Facebook Login** product (for user authentication flow)
4. Go to **App Settings → Basic**:
   - Copy **App ID** and **App Secret**
5. Set up a **Test App** or submit for review to get extended permissions

**OAuth Flow for Users:**
The app uses OAuth 2.0. Users connect their accounts via:
```
GET https://www.facebook.com/v18.0/dialog/oauth?client_id=<APP_ID>&redirect_uri=<REDIRECT_URI>&scope=pages_read_engagement,instagram_basic,instagram_content_publish
```

**Access Token Setup:**
1. Create a Facebook Page
2. Go to **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
3. Select your app → Generate User Access Token
4. Request permissions: `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
5. Authorize and copy the token

**Page ID Extraction:**
```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=<TOKEN>"
```

---

### 6. LinkedIn

**Purpose:** Post content to LinkedIn Pages.

**Setup:**

1. Go to https://developer.linkedin.com
2. Create an **App** (must be verified business first)
3. Under **Auth** tab:
   - Add **OAuth 2.0 Redirect URLs** (e.g., `http://localhost:3000/linkedin/callback`)
   - Copy **Client ID** and **Client Secret**
4. Request these **Products**:
   - `Share on LinkedIn`
   - `LinkedIn Login`
5. Verify your app (requires LinkedIn Business verification)

**OAuth Flow:**
```
GET https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=<CLIENT_ID>&redirect_uri=<REDIRECT_URI>&scope=w_member_social,r_liteprofile
```

---

### 7. Threads (Meta)

**Purpose:** Post content to Instagram Threads.

**Note:** Threads uses the same Meta platform as Instagram. The Instagram access token works for Threads API.

**Setup:**
1. Follow Instagram setup above
2. Get Instagram Business Account ID
3. Request `threads_content_publish` permission from Meta

---

### 8. n8n

**Purpose:** Workflow automation for content generation.

**Setup (runs via Docker Compose):**

1. Access n8n UI at http://localhost:5678
2. On first run, create your admin account
3. Create workflows:
   - **Instant Content Workflow**: Receives webhook from backend, generates content
   - **Scheduled Content Workflow**: Cron-based publishing
   - **Approval Workflow**: Handles Discord approval callbacks

**Webhook URLs (update in n8n and .env):**
```env
N8N_WEBHOOK_URL=https://<ngrok-url>/webhook/<instant-workflow-id>
N8N_SCHEDULE_WEBHOOK_URL=https://<ngrok-url>/webhook/<schedule-workflow-id>
N8N_APPROVAL_WEBHOOK_URL=https://<ngrok-url>/webhook/<approval-workflow-id>
N8N_WEBHOOK_SECRET=<generate-with-openssl-rand-hex-32>
```

**n8n → Discord Bot Token (for sending messages):**
Use the same Discord Bot Token from step 4.

---

### 9. Cloudinary (Optional)

**Purpose:** Media storage and transformation for generated images/videos.

**Setup:**

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to **Dashboard** → Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **Upload Preset** → Create in **Settings → Upload** → Upload presets → Add upload preset

**Set in `.env`:**
```env
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
```

---

### Quick Reference: Required Credentials

| Service | Required For | Where to Get |
|---------|-------------|--------------|
| PostgreSQL | Database | Docker Compose (self-contained) |
| `SECRET_KEY` | JWT auth | `openssl rand -hex 32` |
| ngrok | Discord→n8n tunnel | ngrok.com |
| Discord Public Key | Discord interactions | Discord Developer Portal |
| Discord Bot Token | Bot messaging | Discord Developer Portal |
| Facebook App | Social posting | developers.facebook.com |
| Instagram Token | Social posting | Via Facebook Graph API |
| LinkedIn App | Social posting | developer.linkedin.com |
| n8n | Workflows | Docker Compose |
| Cloudinary | Media uploads | cloudinary.com (optional) |

---

### Environment Files

The project uses **two** `.env` files:

**1. Root `.env` (Backend & Docker):**
```env
SECRET_KEY=<jwt-secret>
POSTGRES_USER=socialhandler
POSTGRES_PASSWORD=<db-password>
POSTGRES_DB=socialhandler
DATABASE_URL=postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5434/${POSTGRES_DB}
DISCORD_PUBLIC_KEY=<discord-public-key>
N8N_WEBHOOK_SECRET=<n8n-secret>
N8N_WEBHOOK_URL=<ngrok-url>/webhook/<instant-id>
N8N_SCHEDULE_WEBHOOK_URL=<ngrok-url>/webhook/<schedule-id>
N8N_APPROVAL_WEBHOOK_URL=<ngrok-url>/webhook/<approval-id>
N8N_WEBHOOK_URL_UI=<ngrok-url>
NGROK_AUTHTOKEN=<ngrok-token>
```

**2. Frontend `.env` (in `/frontend` directory):**
```env
VITE_API_URL=/api
DISCORD_BOT_TOKEN=<discord-bot-token>
```

---

## Running the Application

### Prerequisites

- Python 3.13+
- Node.js 18+ (for frontend development)
- PostgreSQL 16
- Docker & Docker Compose (for full stack)
- Git

### Quick Start (Docker Compose - Full Stack)

This is the fastest way to get everything running:

```bash
# 1. Clone the repository
git clone <repo-url>
cd Social-Content-Automation

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and fill in required values:
#    - SECRET_KEY: Generate with `openssl rand -hex 32`
#    - POSTGRES_PASSWORD: Choose a strong password
#    - NGROK_AUTHTOKEN: Get from ngrok.com (free account)
#    - N8N_WEBHOOK_SECRET: Generate with `openssl rand -hex 32`

# 4. Start all services
docker compose up -d

# 5. Verify services are running
docker compose ps

# 6. Access the applications:
#    - Frontend:     http://localhost:3000
#    - Backend API:  http://localhost:8000
#    - API Docs:     http://localhost:8000/docs
#    - n8n Editor:   http://localhost:5678
#    - ngrok UI:     http://localhost:4040
```

### Local Development Setup

#### Backend Only

```bash
# 1. Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install dependencies
uv sync --group dev

# 3. Create .env file
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations (create tables)
uv run alembic upgrade head

# 5. Start the backend server
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend Only (with existing backend)

```bash
# 1. Go to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

#### Full Local Stack (Backend + Frontend + Database)

```bash
# Start PostgreSQL only via docker
docker compose up -d postgres

# Or run PostgreSQL locally on port 5432

# Start backend
uv run uvicorn app.main:app --reload --port 8000

# In another terminal, start frontend
cd frontend && npm install && npm run dev
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5434 | PostgreSQL 16 database |
| `backend` | 8000 | FastAPI backend |
| `frontend` | 3000 | React frontend |
| `n8n` | 5678 | Workflow automation |
| `caddy` | 80/443 | Reverse proxy |
| `ngrok` | 4040 | Public URL tunnel |

### Useful Docker Commands

```bash
# Start all services
docker compose up -d

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f n8n

# Restart a specific service
docker compose restart n8n

# Stop all services
docker compose down

# Stop and remove volumes (CLEAN slate)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Access PostgreSQL database
docker compose exec postgres psql -U socialhandler -d socialhandler
```

### API Documentation

Once running, access the interactive API docs:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Inspecting PostgreSQL Data

## Inspecting PostgreSQL Data

### Quick Commands

```bash
# List all tables
docker compose exec postgres psql -U socialhandler -d socialhandler -c '\dt'

# View all users
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT * FROM users;'

# View all content
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT id, topic, status, mode FROM social_contents;'

# View all businesses
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT * FROM businesses;'

# View all social accounts
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT * FROM social_accounts;'

# View all discord configs
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT * FROM discord_configs;'

# Count content by status
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'SELECT status, COUNT(*) FROM social_contents GROUP BY status;'

# Update content status
docker compose exec postgres psql -U socialhandler -d socialhandler -c "UPDATE social_contents SET status = 'done' WHERE id = 'your-content-id';"

# Reset failed content for retry
docker compose exec postgres psql -U socialhandler -d socialhandler -c "UPDATE social_contents SET status = 'pending', n8n_status_code = NULL, n8n_response = NULL WHERE id = 'your-content-id';"

# Delete all data (careful!)
docker compose exec postgres psql -U socialhandler -d socialhandler -c 'TRUNCATE TABLE users, businesses, social_accounts, social_contents, discord_configs RESTART IDENTITY CASCADE;'
```

---

## Security Features

### Credential Encryption
All tokens (social access tokens, Discord bot tokens) are encrypted at rest using **Fernet** (AES-128-CBC with HMAC). The encryption key is derived from `SECRET_KEY` using SHA256.

### Password Hashing
User passwords are hashed using **Argon2** via `pwdlib`, providing strong protection against brute-force and rainbow table attacks.

### JWT Security
- Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60 minutes)
- Timing-attack protection: if user doesn't exist, a dummy hash is verified to prevent username enumeration

### n8n Webhook Authentication
Webhook requests are authenticated using HMAC comparison of the `X-N8N-Webhook-Secret` header against `N8N_WEBHOOK_SECRET`.

### Discord Interaction Verification
Discord button clicks are verified using **Ed25519** signatures. Requests with invalid signatures or timestamps older than 300 seconds are rejected.

---

## n8n Webhook Payload Structure

When content is created with `mode=instant`, the API sends this payload to `N8N_WEBHOOK_URL`:

```json
{
  "hasRow": true,
  "mode": "instant",
  "rowNumber": 1,
  "row_number": 1,
  "job": {
    "contentId": "uuid",
    "businessId": "uuid",
    "publishDate": "2026-08-20",
    "publishTime": "10:00",
    "status": "pending"
  },
  "business": {
    "id": "uuid",
    "name": "Business Name",
    "type": "Technology",
    "about": "...",
    "products": "...",
    "website": "https://...",
    "logo": "",
    "targetAudience": "...",
    "brandTone": "Professional & Engaging",
    "industry": "Technology",
    "brandStyle": "Professional"
  },
  "content": {
    "topic": "Why Practical Engineering Skills Matter More Than Ever in the AI Era",
    "platforms": ["Facebook"],
    "goal": "Brand Awareness",
    "cta": "Learn More About Elevate-X",
    "userPrompt": "Create educational and engaging...",
    "feedback": ""
  },
  "media": {
    "type": "image",
    "url": null,
    "source": "generated",
    "generate": true,
    "prompt": "Why Practical Engineering Skills...",
    "instructions": "Create a modern educational illustration..."
  },
  "credentials": {
    "facebook_token": "decrypted-token",
    "facebook_account_id": "page-id",
    "instagram_token": "decrypted-token",
    "instagram_account_id": "account-id",
    "linkedin_token": "decrypted-token",
    "linkedin_account_id": "account-id",
    "threads_token": "decrypted-token",
    "threads_account_id": "account-id",
    "discord_bot_token": "decrypted-bot-token",
    "discord_channel_id": "channel-id",
    "cloudinary_cloud_name": "cloud-name",
    "cloudinary_upload_preset": "upload-preset"
  }
}
```

---

## Content Approval Workflow

1. **User creates content** via `POST /api/v1/content` with `mode=instant`
2. **API triggers n8n** webhook with full payload including credentials
3. **n8n generates content** (images, captions) using AI
4. **n8n sends content to Discord** channel for user review
5. **User clicks APPROVE ALL or DECLINE ALL** button on Discord message
6. **Discord sends interaction** to `POST /api/integrations/discord/interactions`
7. **API verifies signature** and notifies n8n approval webhook
8. **n8n publishes** to social platforms or aborts based on approval

---

## Why ngrok is Used in This Project

### The Problem: Private vs Public URLs

n8n runs inside Docker at `http://n8n:5678`. This is a **private address** only accessible within the Docker network. External services like Discord cannot reach it.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Computer                             │
│                                                                  │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │   Backend    │ ──────> │     n8n      │                    │
│   │  (port 8000) │   ✅    │ (port 5678)  │                    │
│   └──────────────┘         └──────────────┘                    │
│          │                         │                             │
│          │                         │                             │
│          │                    Private URL                        │
│          │                   (Docker network)                    │
└──────────┼──────────────────────────────────────────────────────┘
           │
           │ External services CANNOT access
           │ http://n8n:5678 or http://backend:8000
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INTERNET (Discord, etc.)                    │
│                                                                  │
│   Discord ──X──> http://n8n:5678/webhook/...  ❌ Not reachable   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: ngrok Tunnel

ngrok creates a **public URL** that tunnels traffic to your local n8n instance:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Computer                             │
│                                                                  │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │   Backend    │ ──────> │     n8n      │                    │
│   │  (port 8000) │         │ (port 5678)  │                    │
│   └──────────────┘         └──────────────┘                    │
│          │                         │                             │
│          │                         │                             │
│          │                    Private URL                        │
│          │                   (Docker network)                   │
│          │                         │                             │
│          │                         ▼                             │
│          │                  ┌──────────────┐                    │
│          │                  │    ngrok     │                    │
│          │                  │   (tunnel)   │                    │
│          │                  └──────────────┘                    │
│          │                         │                             │
└──────────┼─────────────────────────┼────────────────────────────┘
           │                         │
           │                         │  Public URL
           │                         │  https://xxx.ngrok-free.dev
           ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INTERNET (Discord, etc.)                    │
│                                                                  │
│   Discord ───────> https://xxx.ngrok-free.dev/webhook/...  ✅   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What Works WITHOUT ngrok (Internal Docker Network)

| Communication | URL | Status |
|---------------|-----|--------|
| Backend → n8n | `http://n8n:5678/webhook/...` | ✅ Works |
| Frontend → Backend | `http://backend:8000/api/...` | ✅ Works |
| Caddy → Backend | `http://backend:8000` | ✅ Works |
| You → n8n UI | `http://localhost:5678` | ✅ Works |

### What Requires ngrok (or similar public URL)

| Communication | Why ngrok Needed |
|---------------|------------------|
| Discord → n8n webhook | Discord's servers need a public URL to send events |
| External services → n8n | Any remote system triggering workflows |
| Mobile apps → n8n | Apps outside your network need public endpoints |

### Current Configuration in This Project

| Service | Internal URL | Public URL (via ngrok) |
|---------|-------------|------------------------|
| n8n | `http://n8n:5678` | `https://captivity-scenic-enrage.ngrok-free.dev` |
| Backend | `http://backend:8000` | Not exposed (only internal) |
| Frontend | `http://frontend:3000` | Not exposed (only internal) |

### When You DON'T Need ngrok

- **Manual workflow testing**: Open n8n at `http://localhost:5678` and click "Execute Workflow"
- **Backend → n8n triggers**: The backend uses `http://n8n:5678` internally, no external URL needed
- **Development on localhost**: All services accessible from your machine

### Alternatives to ngrok

If you need a permanent public URL instead of ngrok's temporary URLs:

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Cloudflare Tunnel | ✅ Yes | Permanent URLs, fast |
| TailScale | ✅ Yes | VPN-based, secure |
| GitHub Codespaces | ✅ Yes | Built-in port forwarding |
| localhost.run | ✅ Yes | No account needed |

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: could not connect to server
```
**Solution:** Ensure PostgreSQL is running. If using Docker:
```bash
docker compose up -d postgres
```

#### ngrok Failed to Start
```
Error: Your account is limited to 1 tunnel
```
**Solution:** 
1. Get a free ngrok account at https://ngrok.com
2. Get your auth token from the ngrok dashboard
3. Add it to `.env` as `NGROK_AUTHTOKEN=your-token`
4. Restart: `docker compose up -d ngrok`

#### Frontend Can't Connect to Backend
The frontend communicates through the Caddy proxy. Ensure:
1. Caddy is running: `docker compose ps caddy`
2. Frontend env has `VITE_API_URL=/api`
3. Caddyfile is correctly configured

#### n8n Can't Reach Backend
n8n needs the public ngrok URL to communicate with Discord. Update:
1. Set `N8N_WEBHOOK_URL_UI=https://your-ngrok-url` in .env
2. Set `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false` in docker-compose

#### Port Already in Use
```
Error: port 8000 is already in use
```
**Solution:** Either stop the existing service or change the port in docker-compose.yml

### Reset Everything

```bash
# Complete reset (WARNING: deletes all data)
docker compose down -v
docker compose up -d

# Recreate database tables only
docker compose exec backend uv run alembic upgrade head
```

## License

Private project - All rights reserved.
