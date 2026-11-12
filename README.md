# ShopSphere — Mock E-Commerce Web Application

A full-stack online store demo built with **Java, Spring Boot, Spring Security (JWT), PostgreSQL**, and a **React** front end. Includes product browsing, a shopping cart, order checkout, and an admin dashboard for managing the catalog and orders.

```
ecommerce/            → Spring Boot backend (REST API)
ecommerce-frontend/   → React frontend (SPA)
```

---

## Features

- **Auth** — JWT-based registration/login, BCrypt password hashing, role-based access (`CUSTOMER`, `ADMIN`)
- **Product catalog** — categories, search, pagination, admin CRUD
- **Shopping cart** — add/update/remove items, live stock validation
- **Checkout & orders** — atomic checkout (locks in price, decrements stock), order history, admin order-status management
- **PostgreSQL persistence** via Spring Data JPA / Hibernate
- **Global error handling** with consistent JSON error responses
- **CORS** configured for a local React dev server

---

## Backend — `ecommerce/`

### Tech stack
Java 17 · Spring Boot 3.3 · Spring Security · Spring Data JPA · PostgreSQL · JJWT · Lombok · Maven

### Prerequisites
- JDK 17+
- Maven 3.9+
- PostgreSQL 14+ running locally (or via Docker)

### 1. Create the database
```bash
createdb ecommerce_db
# or via psql:
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
```

### 2. Configure credentials
Edit `src/main/resources/application.yml` (or override with environment variables) if your Postgres user/password differ from the defaults (`postgres` / `postgres`).

You can also override via env vars, e.g.:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecommerce_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
```

### 3. Run
```bash
cd ecommerce
mvn spring-boot:run
```
The API starts on **http://localhost:8080**. Hibernate auto-creates/updates the schema (`ddl-auto: update`), and a `DataSeeder` populates demo categories, products, and an admin account on first boot:

```
Admin login: admin@shop.com / Admin@123
```

### 4. Build a jar
```bash
mvn clean package
java -jar target/ecommerce-1.0.0.jar
```

### Key REST endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Get JWT access/refresh tokens |
| GET | `/api/products` | Public | List products (`?categoryId=&search=&page=&size=`) |
| GET | `/api/products/{id}` | Public | Product details |
| POST/PUT/DELETE | `/api/products/**` | Admin | Manage products |
| GET | `/api/categories` | Public | List categories |
| POST/PUT/DELETE | `/api/categories/**` | Admin | Manage categories |
| GET | `/api/cart` | Customer | View cart |
| POST | `/api/cart/items` | Customer | Add item to cart |
| PUT/DELETE | `/api/cart/items/{id}` | Customer | Update/remove cart item |
| POST | `/api/orders/checkout` | Customer | Place an order from the cart |
| GET | `/api/orders` | Customer | List my orders |
| GET | `/api/orders/{id}` | Customer/Admin | Order details |
| GET | `/api/orders/admin/all` | Admin | List all orders |
| PATCH | `/api/orders/admin/{id}/status?status=` | Admin | Update order status |

All protected endpoints require `Authorization: Bearer <accessToken>`.

---

## Frontend — `ecommerce-frontend/`

### Tech stack
React 18 · React Router · Axios · CSS

### Setup
```bash
cd ecommerce-frontend
npm install
cp .env.example .env   # point REACT_APP_API_URL at your backend if not localhost:8080
npm start
```
Runs on **http://localhost:3000** and talks to the backend at the URL in `.env`.

### Structure
```
src/
  api/         axios client + endpoint wrappers (auth, products, cart, orders)
  context/     AuthContext (JWT/session) and CartContext (live cart state)
  components/  Navbar, ProductCard, ProtectedRoute
  pages/       Shop, ProductDetail, Login, Register, Cart, Checkout,
               Orders, OrderDetail, Admin (products/categories/orders)
```

### Notable behavior
- JWT is stored in `localStorage` and attached to every request via an Axios interceptor.
- A `401` response clears the session and redirects to `/login`.
- `ProtectedRoute` guards customer and admin-only pages.
- The Admin dashboard is only reachable by users with the `ROLE_ADMIN` authority (returned in the login/register response).

---

## Running both together

1. Start PostgreSQL and the backend (`mvn spring-boot:run`) on port 8080.
2. Start the frontend (`npm start`) on port 3000.
3. Register a new account, or log in as the seeded admin to manage products/categories/orders.

## Notes on production hardening

This is a demo/portfolio-grade project. Before shipping to production you'd want to:
- Move the JWT secret and DB credentials to a secrets manager / env vars (not committed config)
- Add refresh-token rotation and a `/api/auth/refresh` endpoint
- Add integration tests (H2 profile is already scaffolded under `src/test/resources`)
- Add rate limiting and HTTPS termination in front of the API
- Replace `ddl-auto: update` with versioned migrations (Flyway/Liquibase)
