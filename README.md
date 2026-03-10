## BookZeno Frontend

### Project Overview

BookZeno is a **modern online bookstore platform** that allows users to browse books, view detailed descriptions, manage their cart, place orders, and track their purchases.  
The **BookZeno Frontend** is a Next.js application that provides a responsive, accessible, and user-friendly interface on top of the backend APIs.

The frontend:

- **Implements the full customer journey**: discovery, search, book details, cart, checkout, payment flow, and order history.
- **Communicates with backend APIs** via a centralized API service layer and Next.js API proxy routes to provide a seamless online bookstore experience.
- **Manages client-side state** for authentication and shopping cart using React Context and hooks.
- **Delivers a polished UI** based on Tailwind CSS, shadcn-style components, and modern design patterns.

---

### Features

- **User Authentication**
  - Login and registration screens.
  - Account activation, password reset and change password flows.
  - Persistent authenticated session using JWT tokens stored in `localStorage`.

- **Book Browsing & Search**
  - Home page with hero section, featured books, and “all books” listing.
  - Category-based browsing (e.g. `/category/[slug]`).
  - Keyword search (e.g. `/search?q=...`) with query-bound navigation and filters.

- **Book Detail Pages**
  - Dynamic book detail route at `/book/[id]`.
  - Book information, pricing, cover image, and reviews.
  - Add-to-cart and rating/review capabilities.

- **Shopping Cart System**
  - Cart view at `/cart` with items, quantities, and price summary.
  - Add, remove, and update quantities via a dedicated `CartProvider` context.
  - Automatic cart merging when a guest user logs in.

- **Order Placement & Checkout**
  - Checkout flow at `/checkout` with address and contact form.
  - Order creation against backend checkout endpoints.
  - Redirect to payment flow (e.g. PayPal) and handling of payment callbacks.

- **Order History & Details**
  - Account dashboard routes under `/account/*` for:
    - Overview/dashboard
    - Order list and individual order detail pages (`/account/orders`, `/account/orders/[order_number]`).
  - Order summary with totals, tax, and line items.

- **Invoice & Purchase Summary**
  - Order success and payment success pages (e.g. `/order-success/[order_id]`, `/payment-success`) that provide a **print-friendly order summary/invoice-style view**.
  - Users can review and print order information after checkout.

- **Responsive Design**
  - Mobile-first layout using Tailwind CSS utility classes.
  - Adaptive navigation with a collapsible mobile menu and desktop navbar.
  - Layouts optimized for mobile, tablet, and desktop.

- **Clean UI & UX**
  - Modern typography and color system with light/dark modes.
  - Reusable UI primitives (buttons, inputs, dialogs, toasts, tables, etc.).
  - Toast-based feedback, loading states, and graceful empty states.

---

### Tech Stack

- **Framework**
  - **Next.js 16 (App Router)** with server and client components.
  - **React 19** with TypeScript.

- **Styling & UI**
  - **Tailwind CSS v4** for utility-first styling.
  - Design tokens and themes via CSS custom properties.
  - **shadcn-style UI components** backed by:
    - `@radix-ui/react-*` primitives
    - `class-variance-authority`, `tailwind-merge`
  - **Icons**: `lucide-react`.
  - **Theme support** via `next-themes` with light/dark mode.

- **API Communication**
  - Built-in **`fetch`** with a custom abstraction `apiFetch` in `lib/api.ts`.
  - **Next.js API routes** under `app/api/proxy/*` used as a **proxy layer** to the backend to avoid CORS issues and keep calls same-origin.

- **State Management**
  - **React Context + Hooks**:
    - `AuthProvider` in `lib/auth-context.tsx` for authentication state.
    - `CartProvider` in `lib/cart-context.tsx` for shopping cart state.
  - Local component state and custom hooks (`hooks/use-toast`, `hooks/use-mobile`).

- **Tooling**
  - **TypeScript** for static typing.
  - **ESLint** (via `npm run lint`).
  - **PostCSS** for CSS processing.
  - Next.js build pipeline (`next build`, `next start`).

- **Analytics & Deployment**
  - **@vercel/analytics/next** for analytics.
  - Optimized for deployment on **Vercel**, but compatible with any Node.js hosting platform that can run Next.js.

---

### UI Architecture

The frontend is structured around a **component-based architecture** with a clear separation between **layout, routing, state, and API access**.

- **App Router & Pages**
  - All routes live under the `app/` directory using the Next.js App Router:
    - Public routes: `/`, `/books`, `/book/[id]`, `/category/[slug]`, `/search`, `/cart`, `/checkout`, etc.
    - Auth routes: `/login`, `/register`, `/forgot-password`, `/reset-password/[uid]/[token]`, `/activate/[uid]/[token]`.
    - Account routes: `/account`, `/account/dashboard`, `/account/orders`, `/account/orders/[order_number]`, `/account/profile`, `/account/change-password`, `/account/security`.
    - Payment routes: `/payment/[order_id]`, `/payment/callback`, `/payment-success`, `/order-success/[order_id]`.
    - API proxy routes: `/api/proxy/[...path]`, `/api/proxy/api/category`, etc.

- **Component-Based Architecture**
  - **Layout components** (e.g. `app/layout.tsx`) provide the global shell, fonts, theme, and providers.
  - **Page-level components** in `app/*` compose feature components from `components/`.
  - **Reusable UI primitives** in `components/ui/*` (buttons, inputs, avatars, dialogs, tables, etc.).
  - **Feature components** such as `Navbar`, `HeroSection`, `BookCard`, `CategorySection`, `CartClient`, `CheckoutClient`, and account-related dashboard components.

- **API Service Layer**
  - All backend interaction is centralized in `lib/api.ts`:
    - Shared `apiFetch` wrapper:
      - Adds auth headers from local storage.
      - Routes all requests through `/api/proxy` to the backend.
      - Handles JSON parsing, error normalization, and 401 token-refresh logic.
    - Domain-specific functions:
      - Books: `getBooks`, `searchBooks`, `getBookBySlug`, `getBookReviews`, `submitBookReview`, `deleteBookReview`.
      - Categories: `getCategories`, `getBooksByCategory`.
      - Cart: `getCart`, `addToCart`, `removeFromCart`, `decrementCartItem`, `mergeCart`, `clearCart`.
      - Authentication: `loginUser`, `registerUser`, `logoutUser`, `getCurrentUser`, `refreshAccessToken`.
      - Account & Profile: `getDashboard`, `getUserProfile`, `updateUserProfile`, `getAccountOrders`.
      - Orders & Checkout: `createCheckout`, `getOrders`, `getOrderByNumber`.
      - Payments: `createPayment`, `capturePayment`, `getPaymentDetails`.

- **State Management**
  - **Auth Context** (`lib/auth-context.tsx`):
    - Keeps track of the logged-in user and authentication status.
    - Syncs user data with backend `me` endpoint on initialization.
    - Persists tokens and user object to `localStorage` and retrieves them on load.
  - **Cart Context** (`lib/cart-context.tsx`):
    - Manages cart items, totals, and loading states.
    - Derives `subtotal`, `tax`, and `total` on the client.
    - Synchronizes with backend cart endpoints and supports guest cart merging after login.

- **Responsive Layout Strategy**
  - Tailwind utility classes are used to implement:
    - **Flexible layouts** with `flex`, `grid`, and `gap` utilities.
    - **Responsive breakpoints** (e.g. `md:`, `lg:`) for rearranging navigation, grids, and page sections.
    - **Conditional UI** for mobile vs desktop (e.g. mobile drawer menu vs full-width navbar).
  - Theme switching is handled via `ThemeProvider` and `next-themes`, enabling light/dark mode with CSS variables.

---

### Folder Structure

High-level structure of the frontend project:

```text
app/
  layout.tsx          # Root layout, providers, fonts, analytics
  page.tsx            # Home page (hero, categories, featured, all books)
  books/              # Books listing route(s)
  book/[id]/page.tsx  # Book detail page
  cart/page.tsx       # Cart view
  checkout/page.tsx   # Checkout view
  account/            # Account dashboard and sub-pages
  login/page.tsx      # Login page
  register/page.tsx   # Registration page
  ...                 # Other auth, payment, order success routes
  api/proxy/          # API proxy routes for backend communication

components/
  navbar.tsx
  footer.tsx
  hero-section.tsx
  category-section.tsx
  featured-books.tsx
  all-books.tsx
  book-card.tsx
  cart-client.tsx
  checkout-client.tsx
  ...                 # Account dashboard, order, payment, and utility components
  ui/                 # Reusable UI primitives (button, input, dialog, tabs, toast, etc.)

lib/
  api.ts              # Centralized API client and domain methods
  auth-context.tsx    # Authentication context/provider
  cart-context.tsx    # Cart context/provider
  data.ts             # Shared types and mock/shape definitions
  utils.ts            # Utility helpers

hooks/
  use-toast.ts
  use-mobile.ts
  ...                 # Other custom hooks

styles/
  globals.css         # Tailwind CSS and theme tokens

public/
  logo.svg
  icon.svg
  ...                 # Other static assets

next.config.mjs       # Next.js configuration
postcss.config.mjs    # PostCSS configuration
tsconfig.json         # TypeScript configuration
package.json          # Dependencies and scripts
```

**Folder responsibilities:**

- **`app/`**: Routing, layouts, and top-level pages using the Next.js App Router. Also contains API proxy routes under `app/api/proxy/*`.
- **`components/`**: All reusable and page-level components, including the design system components under `components/ui/`.
- **`lib/`**: Core client-side libraries such as the API client, contexts, data types, and general utilities.
- **`hooks/`**: Custom React hooks for shared behavior (e.g. toast handling, responsive detection).
- **`styles/`**: Global styling and Tailwind configuration entry points.
- **`public/`**: Static assets served directly (images, icons, etc.).
- **Root config files** (`next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`): Build and tooling configuration.

---

### Installation and Setup

#### Prerequisites

- **Node.js** (LTS recommended).
- **npm**, **pnpm**, or **yarn** (examples below use `npm`).
- A running instance of the **BookZeno backend API** (Django or similar) accessible via HTTP.

#### Clone the Repository

```bash
git clone <repo-url>
cd bookzeno-frontend
```

#### Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

#### Configure Environment Variables

Create a `.env.local` file in the project root and add the required variables (see [Environment Variables](#environment-variables)).

Example:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-backend-domain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

#### Linting (optional but recommended)

```bash
npm run lint
```

---

### Environment Variables

The frontend uses environment variables to configure backend endpoints and SSR behavior.

Common variables:

- **`NEXT_PUBLIC_API_BASE_URL`**
  - **Purpose**: Base URL of the **backend API**.
  - **Usage**:
    - Used in API proxy routes under `app/api/proxy/*` to forward requests to the backend.
    - Used in places like `lib/cart-context.tsx` and `components/book-card.tsx` to construct absolute image URLs.
  - **Example**:
    ```bash
    NEXT_PUBLIC_API_BASE_URL=https://api.bookzeno.com
    ```

- **`NEXT_PUBLIC_BASE_URL`**
  - **Purpose**: The base URL of the **frontend application** itself.
  - **Usage**:
    - Used in `lib/api.ts` in SSR contexts where `fetch` needs an absolute URL (`process.env.NEXT_PUBLIC_BASE_URL + "/api/proxy/..."`).
  - **Example**:
    ```bash
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

> Note: All `NEXT_PUBLIC_*` environment variables are exposed to the browser, so **never store secrets** in them.

---

### API Integration

The frontend communicates with the backend via:

1. **Next.js API Proxy Routes**
   - Located under `app/api/proxy/*`.
   - All external backend calls are made to **relative URLs** (e.g. `/api/proxy/api/books/`) on the frontend origin.
   - The proxy routes:
     - Read `NEXT_PUBLIC_API_BASE_URL`.
     - Forward the request to the backend (e.g. `https://api.bookzeno.com/api/books/`).
     - Return the response to the frontend, avoiding CORS and simplifying deployment.

2. **Centralized API Client (`lib/api.ts`)**
   - **`apiFetch(endpoint, options)`**:
     - Prepends `/api/proxy` to the endpoint (e.g. `api/books/` → `/api/proxy/api/books/`).
     - Attaches `Authorization: Bearer <access_token>` header if available.
     - Handles JSON vs text responses and normalizes errors to an `APIError` class.
     - Supports automatic token refresh on 401 responses via `refreshAccessToken()`.

3. **Domain-Level API Modules**
   - **Authentication APIs**:
     - `loginUser`, `registerUser`, `logoutUser`, `getCurrentUser`, `refreshAccessToken`.
     - Integrated with `AuthProvider` for session management.
   - **Books APIs**:
     - `getBooks`, `searchBooks`, `getBookBySlug`, `getBookReviews`, `submitBookReview`, `deleteBookReview`.
   - **Categories APIs**:
     - `getCategories`, `getBooksByCategory`.
   - **Cart APIs**:
     - `getCart`, `addToCart`, `decrementCartItem`, `removeFromCart`, `clearCart`, `mergeCart`.
     - Connected to `CartProvider` for reactive UI updates.
   - **Order & Checkout APIs**:
     - `createCheckout`, `getOrders`, `getOrderByNumber`.
   - **Payment APIs**:
     - `createPayment`, `capturePayment`, `getPaymentDetails`.

The result is a **clean separation** between UI components and network logic, with components consuming high-level functions instead of manual `fetch` calls.

---

### Responsive Design

Responsive behavior is implemented primarily via **Tailwind CSS**:

- **Layout**
  - Flexbox and grid layouts adjust based on breakpoints (`md`, `lg`, etc.).
  - Navigation:
    - Desktop: full navbar with search, categories dropdown, account menu, cart, and theme toggler.
    - Mobile: compact navbar with menu button, mobile search, collapsible categories, and stacked actions.
  - Content sections (hero, categories, book grids) adapt from single-column mobile layouts to multi-column desktop layouts.

- **Typography & Spacing**
  - Tailwind utility classes control font sizes, line heights, and spacing for clear readability on small and large screens.

- **Theming**
  - Uses CSS variables with a `.dark` class variant and `next-themes` to support light/dark mode.
  - Ensures good contrast and consistent color mapping across breakpoints.

The combination provides a **mobile-first**, accessible, and visually consistent experience across devices.

---

### Deployment

The project is designed to be **production-ready** and straightforward to deploy.

#### Build Command

```bash
npm run build
```

This runs `next build` and produces an optimized production build.

#### Start Command

```bash
npm start
```

This runs `next start`, serving the production build (by default on port 3000).

#### Typical Deployment Targets

- **Vercel (Recommended)**
  - Import the GitHub repository into Vercel.
  - Vercel automatically detects Next.js and configures build & output.
  - Set environment variables (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_BASE_URL`) in the Vercel project settings.
  - Build command: `npm run build`, Start command: `npm start` (or Vercel’s default Next.js settings).

- **Custom Node.js / Docker Hosting**
  - Ensure Node.js LTS is available.
  - Install dependencies and build:
    ```bash
    npm install
    npm run build
    ```
  - Start with:
    ```bash
    npm start
    ```
  - Configure environment variables at the platform level.

> Ensure the backend API is reachable from the deployed frontend and that `NEXT_PUBLIC_API_BASE_URL` is set to the correct backend URL.

---

### Performance Optimization

The frontend applies several **performance-oriented practices**:

- **Next.js Optimizations**
  - Automatic code splitting by route.
  - Static optimization and server-side rendering where appropriate.
  - Usage of `next/image` (where used) for optimized images.

- **Lazy Loading & Suspense**
  - Components like `Navbar` are wrapped in `React.Suspense` to provide a smooth loading experience.
  - Feature components are structured so heavier content is not rendered until needed.

- **Optimized Assets**
  - SVG icons (`logo.svg`, `icon.svg`) for crisp and lightweight branding.
  - Consolidated global styles in `styles/globals.css`.

- **API Request Handling**
  - `apiFetch` abstracts retry logic and error handling, minimizing duplicate logic and avoiding unnecessary re-requests.
  - Cart and auth contexts avoid redundant calls by caching loaded state and syncing only when required.

- **Efficient Rendering**
  - Context providers (`AuthProvider`, `CartProvider`) localize state while still providing global access.
  - Derived data (like cart totals) is computed from current state, avoiding extra network calls.

---

### Future Improvements

Potential enhancements to evolve BookZeno Frontend:

- **Advanced Search & Filtering**
  - Faceted search (by genre, author, rating, price range).
  - Sorting options (price, popularity, publication date).

- **Personalization & Recommendations**
  - “Recommended for you” section based on user history.
  - “Customers also bought” suggestions on book detail pages.

- **Wishlist & Favorites**
  - Wishlist feature for logged-in users.
  - Quick “heart” actions on book cards.

- **Progressive Web App (PWA)**
  - Add service worker and offline caching.
  - Installable web app for mobile and desktop.

- **Accessibility & Localization**
  - Further ARIA enhancements and keyboard navigation refinements.
  - Multi-language support (i18n) and localized content.

- **Admin & Management UI**
  - Optional admin dashboard for managing inventory, categories, and orders.

---

### Contributing

Contributions are welcome and appreciated.

#### How to Contribute

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone <your-fork-url>
   cd bookzeno-frontend
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
4. **Install dependencies & run the app**:
   ```bash
   npm install
   npm run dev
   ```
5. Make your changes, including:
   - Code changes with TypeScript types where relevant.
   - Tests or manual verification steps where appropriate.
   - Updated documentation or comments if behavior changes.

6. **Run linting** and ensure there are no errors:
   ```bash
   npm run lint
   ```

7. **Commit and push** your changes:
   ```bash
   git commit -m "Add feature: my new feature"
   git push origin feature/my-new-feature
   ```

8. **Open a Pull Request** against the main branch of the original repository, describing:
   - What you changed.
   - Why you changed it.
   - Any impact on existing behavior.

Please keep code style consistent with existing patterns (Tailwind classes, context usage, API abstraction pattern, etc.).

---

### License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this code in personal and commercial projects, subject to the terms of the MIT license.  
For full details, see the `LICENSE` file (or add one to the repository if it does not yet exist).

