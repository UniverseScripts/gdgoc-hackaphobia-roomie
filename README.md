# Roomie 🏠

> **The smart roommate-finding platform for Vietnamese students.**
> Roomie connects university students with compatible roommates and verified rental listings using AI-powered personality matching and semantic search.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)

---

## Overview

Roomie is a full-stack web application built for university students in Ho Chi Minh City, Vietnam. It solves the problem of finding a suitable place to live and a compatible roommate by combining:

1. **AI-Powered Roommate Matching** — A personality questionnaire whose responses are vectorized and compared using cosine similarity to surface the most compatible potential roommates.
2. **Smart Listing Recommendations** — Scored apartment listings that weight location and budget preferences against the user's onboarding profile.
3. **Semantic Market Search** — Natural language search powered by Vertex AI `text-embedding-004` embeddings to find relevant listings beyond keyword matching.
4. **Real-Time Chat** — A WebSocket-based messaging system allowing students to communicate with potential roommates or landlords directly in the app.

---

## Features

| Feature | Description |
| :--- | :--- |
| 🔐 **Multi-Provider Auth** | Login via Google, Facebook, or Email/Password using Firebase Authentication |
| 🧑‍💼 **Role-Based Access Control** | Three distinct roles: `customer` (student), `landlord`, and `admin`, enforced at both JWT claim level and route level |
| 🧭 **Onboarding Flow** | New users complete a profile form. Landlords provide business info; customers provide personal/university details |
| 🧠 **Personality Test** | Multi-dimension questionnaire (sleep schedule, cleanliness, noise tolerance, guest frequency, budget, district priority) that generates a 7-dimensional lifestyle vector |
| 💘 **Roommate Matching** | Cosine similarity engine compares lifestyle vectors from the `test_vectors` collection to find the best-matched users |
| 🏘️ **Listings Page** | Full-screen split view with a property card list and an interactive Leaflet.js map showing real-time, GeoPoint-aware markers |
| 🔍 **Semantic Search** | Natural language property search backed by Vertex AI embeddings with cosine similarity ranking |
| 💬 **Real-Time Chat** | WebSocket-based chat with conversation history, online presence detection, and Firestore message persistence |
| 🏗️ **Landlord Dashboard** | Landlords can stage new properties (`pending_apartments`), create lease/ad requests, and view ad analytics |
| ✅ **Admin Approval Pipeline** | Admins approve staged properties, triggering an atomic Firestore batch that generates a semantic embedding and moves the listing to the live `apartments` collection |
| 🖼️ **Secure Media Upload** | Signed Google Cloud Storage URLs minted by the backend; clients upload images directly to GCS without routing through the API server |
| ⭐ **Transactional Reviews** | Firestore-transactional rating submission that atomically updates `average_rating` and `total_reviews` on the apartment document |
| 🗺️ **Interactive Map** | Leaflet.js map with dynamic price markers, university pinpoints, and panel that links to Google Maps |
| 📡 **OpenTelemetry Tracing** | GCP Cloud Trace integration for distributed request tracing in production |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Firebase Hosting                       │
│  React 19 + Vite SPA (TypeScript)                         │
│  ├── Firebase Auth SDK (Google / Facebook / Email)         │
│  ├── Leaflet.js (Interactive Map)                           │
│  └── authenticatedFetch() → VITE_API_GATEWAY_URL          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS + Bearer JWT
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Google Cloud Run (Backend API)                   │
│  FastAPI + Uvicorn + Python 3.11                           │
│  ├── Firebase Admin SDK (JWT verification)                  │
│  ├── Firestore (primary database)                           │
│  ├── Vertex AI text-embedding-004 (semantic search)        │
│  ├── Google Cloud Storage (signed URL media uploads)       │
│  └── OpenTelemetry → Cloud Trace                           │
└──────────────────────────┬──────────────────────────────┘
                           │ ADC / Service Account
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Google Cloud Platform                         │
│  ├── Cloud Firestore (users, apartments, messages, ...)    │
│  ├── Cloud Storage (user-uploaded images)                  │
│  ├── Vertex AI (text-embedding-004 model)                  │
│  └── Cloud Trace (telemetry)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 19 | UI Framework |
| TypeScript | ~6.0 | Type safety |
| Vite | 8 | Build tool & dev server |
| React Router | 7 | Client-side routing |
| Firebase SDK | 12 | Auth + Firestore client |
| Leaflet.js | 1.9 | Interactive map |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Python | 3.11 | Runtime |
| FastAPI | 0.135 | API framework |
| Uvicorn | 0.44 | ASGI server |
| Firebase Admin SDK | 7.3 | JWT verification + Firestore admin |
| google-cloud-aiplatform | 1.148 | Vertex AI embeddings |
| google-cloud-firestore | 2.26 | Database client |
| google-cloud-storage | 3.10 | Signed URL generation |
| google-cloud-trace | 1.19 | OpenTelemetry export |
| Pydantic | 2.12 | Schema validation |
| NumPy | 2.4 | Cosine similarity calculation |

### Infrastructure
| Service | Purpose |
| :--- | :--- |
| Google Cloud Run | Containerised backend hosting |
| Firebase Hosting | Static frontend hosting |
| Cloud Firestore | NoSQL database |
| Cloud Storage | User media / image storage |
| Vertex AI | Semantic text embeddings |
| Google Cloud Trace | Distributed tracing |
| GitHub Actions | CI/CD pipeline |
| Docker | Backend containerisation |
| Artifact Registry | Docker image registry |

---

## Project Structure

```
roomie/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD: Frontend → Firebase Hosting, Backend → Cloud Run
├── backend/
│   ├── core/
│   │   └── config.py           # App settings, Firebase + Firestore initialization
│   ├── routers/
│   │   ├── auth.py             # Role assignment endpoint + current_user dependency
│   │   ├── onboarding.py       # Profile creation/retrieval, custom claim stamping
│   │   ├── listings.py         # Scored listing recommendations with GeoPoint handling
│   │   ├── matches.py          # Cosine similarity roommate matching engine
│   │   ├── chat.py             # WebSocket real-time chat + REST conversation history
│   │   ├── market.py           # Semantic search + raw apartment listing endpoints
│   │   ├── landlord.py         # Property staging, lease/ad requests
│   │   ├── admin.py            # Property approval with vector embedding generation
│   │   ├── reviews.py          # Transactional review submission
│   │   ├── media.py            # Signed GCS upload URL generation
│   │   └── sponsor.py          # Sponsorship request management + JWT deep-link
│   ├── schemas/
│   │   ├── apartment.py        # Apartment Pydantic models
│   │   ├── user.py             # Customer/Landlord user store schemas
│   │   ├── landlord.py         # Lease, Ad, and PendingApartment schemas
│   │   ├── market.py           # Market search query + review schemas
│   │   └── message.py          # Chat message schemas
│   ├── services/
│   │   ├── auth.py             # Firebase token verification + role claim guards
│   │   ├── matching.py         # Cosine similarity + candidate vector retrieval
│   │   ├── vector_logic.py     # Lifestyle dimension tensor maps + Vertex AI embeddings
│   │   ├── listing_matching.py # Listing score calculation (location + price)
│   │   ├── listing_service.py  # Listing data access helpers
│   │   └── chat_manager.py     # WebSocket connection manager
│   ├── main.py                 # FastAPI app, CORS, OpenTelemetry, router registration
│   ├── Dockerfile              # Python 3.11-slim, non-root user, port 8080
│   └── requirements.txt        # Full pinned dependency list
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing/        # Hero, featured areas, verified listings preview
│   │   │   ├── Login/          # Auth with Google, Facebook, Email
│   │   │   ├── Onboarding/     # Profile completion form (customer / landlord)
│   │   │   ├── PersonaTest/    # Lifestyle questionnaire → vector generation
│   │   │   ├── Listings/       # Split-panel listing browser + Leaflet map
│   │   │   ├── Matches/        # Roommate cards sorted by match score
│   │   │   ├── Chat/           # WebSocket chat UI with conversation list
│   │   │   └── Settings/       # User settings
│   │   ├── components/
│   │   │   ├── Header.tsx      # Persistent navigation bar
│   │   │   ├── Footer.tsx      # Site footer
│   │   │   ├── ProtectedRoute.tsx  # Route guard (auth + role check)
│   │   │   └── MatchCard/      # Roommate match card component
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Auth state, profile fetching, login/logout methods
│   │   ├── lib/
│   │   │   ├── firebase.ts     # Firebase app initialization
│   │   │   └── api.ts          # authenticatedFetch + signed upload helper
│   │   └── types/
│   │       └── index.ts        # Shared TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── firebase.json               # Firebase Hosting: serves frontend/dist with SPA fallback
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** 22+
- **Python** 3.11+
- **Google Cloud SDK** (`gcloud`) with a configured project
- A **Firebase project** with Authentication, Firestore, and Storage enabled
- Application Default Credentials (ADC) configured locally:
  ```bash
  gcloud auth application-default login
  ```

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create the .env file (see Environment Variables section)
cp .env.example .env
# Edit .env with your values

# 5. Start the development server
uvicorn main:app --reload --port 8080
```

The interactive API docs will be available at `http://localhost:8080/docs`.

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create a .env file with your Firebase credentials
# (see Environment Variables section)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
| :--- | :--- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to your local GCP service account JSON key (for local dev). In production, use ADC / Workload Identity. |
| `STORAGE_BUCKET` | Your Firebase Storage bucket name (e.g. `your-project.appspot.com`) |
| `SECRET_KEY` | Application secret key for JWT signing |
| `ALGORITHM` | JWT signing algorithm (default: `HS256`) |

### Frontend (`frontend/.env`)

| Variable | Description |
| :--- | :--- |
| `VITE_API_GATEWAY_URL` | Base URL of the deployed Cloud Run backend |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_CONFIG` | *(Optional)* Full Firebase config as a JSON string. If set, overrides all individual `VITE_FIREBASE_*` keys. |

---

## API Reference

All backend routes are prefixed with `/api`.

### Authentication & Onboarding
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/set-role` | Admin | Assign a role to a user (sets JWT claim + Firestore) |
| `POST` | `/api/onboarding/profile` | User | Create or update user profile (discriminated by `role` field) |
| `GET` | `/api/onboarding/profile` | User | Retrieve current user's profile |
| `GET` | `/api/onboarding/status` | User | Check if user has completed onboarding |

### Listings & Market
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings/recommendations` | Optional | Scored listings with GeoPoint-aware coordinate serialization |
| `POST` | `/api/market/search` | None | Semantic search with optional filters (type, location, budget, natural language) |
| `GET` | `/api/market` | None | Raw apartment listing (up to 50 items) |
| `GET` | `/api/market/{type}/{id}` | None | Retrieve a specific apartment by type and ID |

### Matching
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/matches/my-matches` | Customer | Returns a list of compatible users sorted by cosine similarity match score |

### Chat
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat/conversations` | User | Conversation list with last message and online status |
| `GET` | `/api/chat/history/{partner_id}` | User | Paginated message history for a specific thread |
| `GET` | `/api/chat/partner/{partner_id}` | User | Partner profile info (name, avatar) |
| `WS` | `/api/chat/ws/{user_id}/{token}` | Token in URL | Real-time bidirectional messaging |

### Landlord
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/landlord/properties/stage` | Landlord | Submit a new property for admin review |
| `POST` | `/api/landlord/lease/request/{id}` | Landlord | Create a lease request |
| `POST` | `/api/landlord/ads/request/{id}` | Landlord | Create an advertisement request |
| `GET` | `/api/landlord/ads/{id}/analytics` | Landlord | Get ad performance metrics |

### Admin
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/properties/approve/{property_id}` | Admin | Approve a staged property: generates embedding and atomically publishes it |

### Reviews & Media
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews/` | Customer | Submit a review. Atomically updates `average_rating` and `total_reviews` |
| `GET` | `/api/media/upload-url` | User | Generate a 15-minute signed GCS URL for direct image upload |

### Other
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | Health check endpoint |

---

## Deployment

### Backend (Google Cloud Run)

The backend is containerised using `backend/Dockerfile` (Python 3.11-slim, non-root user, port 8080).

```bash
# Build and push to Artifact Registry
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT/roomie-repo/roomie-backend:latest ./backend
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/roomie-repo/roomie-backend:latest

# Deploy to Cloud Run
gcloud run deploy roomie-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/roomie-repo/roomie-backend:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account firebase-adminsdk-fbsvc@YOUR_PROJECT.iam.gserviceaccount.com
```

### Frontend (Firebase Hosting)

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline runs on every push to `main` and executes two parallel jobs:

**`deploy-frontend`**
1. Validates that all required environment secrets (`VITE_FIREBASE_*`, `VITE_API_GATEWAY_URL`) are present.
2. Installs dependencies and builds the Vite SPA (`npm run build`).
3. Deploys the `frontend/dist` output to Firebase Hosting via the `FirebaseExtended/action-hosting-deploy` action.

**`deploy-backend`**
1. Authenticates to GCP using the `GCP_CREDENTIALS` secret.
2. Builds a Docker image tagged with the commit SHA and pushes it to Artifact Registry.
3. Deploys the new image to the `roomie-backend` Cloud Run service.

### Required GitHub Secrets

| Secret | Used By |
| :--- | :--- |
| `GCP_CREDENTIALS` | Backend job — GCP authentication |
| `GCP_PROJECT_ID` | Both jobs |
| `FIREBASE_SERVICE_ACCOUNT` | Frontend job — Firebase Hosting deploy |
| `VITE_API_GATEWAY_URL` | Frontend build |
| `VITE_FIREBASE_API_KEY` | Frontend build |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend build |
| `VITE_FIREBASE_PROJECT_ID` | Frontend build |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend build |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend build |
| `VITE_FIREBASE_APP_ID` | Frontend build |

---

## Firestore Collections

| Collection | Description |
| :--- | :--- |
| `users` | User profiles (username, role, university, bio, etc.) |
| `apartments` | Active, publicly searchable rental listings |
| `pending_apartments` | Staged listings awaiting admin approval |
| `messages` | Chat messages with `thread_id`, `sender_id`, `receiver_id` |
| `test_vectors` | Personality test results with 7-dimensional lifestyle vectors |
| `reviews` | User-submitted apartment reviews |
| `lease_requests` | Landlord lease applications |
| `advertisements` | Landlord ad requests with analytics |
| `sponsors` | Sponsorship programme applications |

---

*Built for GDGoC Hackaphobia 2026 — Roomie Team*
