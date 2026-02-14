# Expense Daddy - Personal Budget & Expenses Tracker

## Overview
A personal budget and expenses tracker mobile app built with Expo (React Native) and Express backend. Features a dark-mode-only fintech UI with modern Inter font, grey color palette. Uses Bangladeshi Taka (৳) as default currency.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server on port 5000 (API + landing page)
- **Database**: PostgreSQL (Neon-backed) with Drizzle ORM
- **Auth**: Session-based authentication with bcrypt password hashing, express-session + connect-pg-simple
- **State**: AsyncStorage for local expense data, React Context for state management, AuthContext for auth state
- **Styling**: Dark mode fintech grey palette (#0A0A0A background), Inter font family
- **Navigation**: 5 tabs (Home, Expenses, Insights, Cards, Profile)

## Key Features
- User authentication (register, login, logout, password change)
- Dashboard with budget ring, daily/monthly spending, top categories
- Full expense CRUD with categories, tags, notes, recurring expenses
- Budget management with monthly/daily targets and history
- Insights with daily/monthly summaries, category breakdown, calendar heatmap
- Saved card management
- Savings goals tracker
- Activity log
- Profile with settings, account management

## Auth Flow
- Unauthenticated users redirected to /login
- Session-based auth with cookies (30-day expiry)
- AuthGuard component in root layout handles routing
- Profile synced between server (user table) and local AsyncStorage

## API Routes
- POST /api/auth/register - Create account
- POST /api/auth/login - Sign in
- POST /api/auth/logout - Sign out
- GET /api/auth/me - Get current user
- PUT /api/auth/profile - Update display name, currency, budget settings
- PUT /api/auth/password - Change password

## Project Structure
```
app/
  _layout.tsx         - Root layout with AuthProvider, BudgetProvider, AuthGuard
  login.tsx           - Login screen
  register.tsx        - Registration screen
  (tabs)/
    _layout.tsx       - Tab navigation (5 tabs with liquid glass support)
    index.tsx         - Home/Dashboard
    expenses.tsx      - Expense list with search/filter
    insights.tsx      - Daily/Monthly/Calendar insights
    cards.tsx         - Saved cards management
    profile.tsx       - Profile, settings, account, activity log
  add-expense.tsx     - Modal: Add new expense
  edit-expense.tsx    - Modal: Edit existing expense
  add-card.tsx        - Modal: Add saved card
  budget-settings.tsx - Modal: Budget configuration
  add-goal.tsx        - Modal: Savings goals management

lib/
  types.ts           - TypeScript types and constants
  storage.ts         - AsyncStorage CRUD operations
  BudgetContext.tsx   - React Context for budget/expense state
  AuthContext.tsx     - React Context for authentication state
  helpers.ts         - Formatting and utility functions
  query-client.ts    - React Query client setup

server/
  index.ts           - Express server setup with CORS, body parsing
  routes.ts          - API routes with session auth
  storage.ts         - Database CRUD operations (Drizzle)
  db.ts              - Database connection pool

shared/
  schema.ts          - Drizzle schema (users table)

constants/
  colors.ts          - Dark theme color palette
```

## User Preferences
- Dark mode only interface
- Modern fintech grey color scheme
- Inter font family
- Easy navigation with tab bar
- Bangladeshi Taka (৳) as default currency
