# Celestia: Real Estate App

A full-stack real estate listing app where visitors can browse, search and filter properties, and registered agents can list and manage their own properties.

Built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## Features

- **Browse properties** with a clean card layout and a detail popup
- **Search and filters**: city and locality search, price range, property type, Sale/Rent, bedrooms and bathrooms
- **Sorting and pagination**: newest, oldest, price and area sorting, with server-side pagination
- **Navbar quick filters**: Buy, Rent and All buttons
- **Authentication**: register, login and logout with JWT, shown as a popup over the home page
- **Role-based access**: `user`, `agent` and `admin`
- **Property management**: agents can add properties and edit or delete their own; admins can manage all
- **Shareable filters**: search and filter state is kept in the URL
- **Responsive design** with a blue, green and black theme

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, plain CSS |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB (local or Atlas), with an in-memory fallback for development |
| Auth | JSON Web Tokens (JWT), bcryptjs, express-rate-limit |

---

## Project structure

```
Real Estate/
├── backend/
│   ├── config/            # Database connection
│   ├── controllers/       # propertyController, authController
│   ├── middleware/        # authMiddleware (protect, authorize), errorMiddleware
│   ├── models/            # Property, User
│   ├── routes/            # propertyRoutes, authRoutes
│   ├── utils/             # validation, query builder, seed scripts
│   ├── app.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/    # AuthModal, FilterPanel, Pagination, ProtectedRoute
│       ├── context/       # AuthContext
│       ├── hooks/         # usePropertySearch, useDebounce
│       ├── pages/         # HomePage
│       ├── services/      # propertyService, authService
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── package.json           # Convenience scripts to run both apps
└── README.md
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm
- MongoDB (optional; without it the backend uses a temporary in-memory database)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Real Estate"
```

### 2. Set up the backend

Install packages **inside the backend folder**:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/real-estate-db

# Authentication
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

# Allowed frontend origin (CORS)
CLIENT_URL=http://localhost:5173

# Used only by the admin seed script
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!

# Set to true in development to add sample properties on start
SEED_SAMPLE_DATA=false
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `MONGO_URI` is optional. If it is not set, the backend starts an in-memory MongoDB. Data is lost every time the server restarts, so users and properties will need to be created again.

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Set up the frontend

Install packages **inside the frontend folder**:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

> Only variables that start with `VITE_` are exposed to the browser. Never put secrets in `frontend/.env`.

### Run both from the project root (optional)

```bash
npm run backend     # starts the backend
npm run frontend    # starts the frontend
```

Do not run `npm install` in the project root. Install backend packages in `backend/` and frontend packages in `frontend/`.

---

## Useful scripts

### Backend (`cd backend`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API with Node |
| `npm run seed:admin` | Create the first admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` |
| `npm run seed:properties` | Add about 40 sample properties (safe to repeat, no duplicates) |
| `npm run seed:properties:remove` | Remove only the sample properties, never your real data |

### Frontend (`cd frontend`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

---

## User roles

| Role | Can do |
|---|---|
| Visitor (not logged in) | Browse, search, filter and view properties |
| `user` | Everything a visitor can do, with an account |
| `agent` | Add properties, and edit or delete their own |
| `admin` | Manage all properties |

Admins cannot be created through the registration form. Use `npm run seed:admin`.

---

## API reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account (`user` or `agent`) |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| GET | `/auth/me` | Logged in | Get the current user |

Protected requests send the token as `Authorization: Bearer <token>`.

### Properties

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/properties` | Public | List properties with search, filters, sorting and pagination |
| GET | `/properties/filters` | Public | Available cities, property types and price ranges |
| GET | `/properties/:id` | Public | Get one property |
| POST | `/properties` | Agent, Admin | Create a property |
| PUT | `/properties/:id` | Owner, Admin | Update a property |
| DELETE | `/properties/:id` | Owner, Admin | Delete a property |

### Query parameters for `GET /properties`

| Parameter | Example | Description |
|---|---|---|
| `search` | `search=sector 62` | Matches title, location, city, state and description |
| `city` | `city=Noida` | Filter by city |
| `minPrice`, `maxPrice` | `minPrice=3000000&maxPrice=8000000` | Price range |
| `propertyType` | `propertyType=Apartment,Flat` | One or more types |
| `listingType` | `listingType=Rent` | `Sale` or `Rent` |
| `bedrooms` | `bedrooms=3` | Minimum bedrooms (3 or more) |
| `bathrooms` | `bathrooms=2` | Minimum bathrooms |
| `sort` | `sort=price_asc` | `newest`, `oldest`, `price_asc`, `price_desc`, `area_asc`, `area_desc` |
| `page`, `limit` | `page=2&limit=9` | Pagination (limit up to 50) |

Example response:

```json
{
  "properties": [],
  "pagination": {
    "page": 1,
    "limit": 9,
    "total": 46,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Property model

| Field | Type | Notes |
|---|---|---|
| `title`, `description` | String | Required |
| `price` | Number | Required, positive |
| `location`, `city`, `state` | String | Location is required |
| `propertyType` | String | Apartment, Villa, House, Flat or Plot |
| `listingType` | String | Sale or Rent |
| `bedrooms`, `bathrooms` | Number | Required |
| `area` | Number | Square feet, required |
| `image`, `images` | String, [String] | Valid URLs |
| `amenities`, `features` | [String] | Optional |
| `agent` | Object | Name, email and phone |
| `owner` | ObjectId | The user who created the listing |

---

## Testing the app

1. Register an agent from the Sign Up popup.
2. Add a property and check that it appears in the list.
3. Log out and confirm the Edit and Delete buttons disappear.
4. Try the search bar, filters, sorting and pagination.
5. Refresh the page and confirm the filters and login session are kept.

---

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- JWT secrets and database URLs live in `.env` files, which are ignored by Git.
- Login and register endpoints are rate limited.
- CORS only allows the frontend origin set in `CLIENT_URL`.
- Permissions are enforced on the backend. Hiding buttons in the UI is only for convenience.
- Search input is escaped before it is used in database queries.

---

## Deployment tips

- Set `NODE_ENV=production`, a strong `JWT_SECRET` and a real `MONGO_URI` (for example MongoDB Atlas).
- Set `CLIENT_URL` to your deployed frontend URL and `VITE_API_URL` to your deployed API URL.
- Build the frontend with `npm run build` and serve `frontend/dist`.
- Sample data seeding is disabled in production.

---

## Roadmap

- Forgot password and email verification
- Save favourite properties
- Image uploads instead of image URLs
- Map view and saved searches
- Property enquiry and contact form

---

## License

This project is for learning and portfolio use. Add a license of your choice (for example MIT) before sharing it publicly.
