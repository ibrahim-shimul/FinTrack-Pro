# BudgetFlow - Personal Budget & Expenses Tracker

## Overview
A personal budget and expenses tracker mobile app built with Expo (React Native) and Express backend. Features a dark-mode-only fintech UI with modern Inter font, grey color palette.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server on port 5000 (API + landing page)
- **State**: AsyncStorage for local data persistence, React Context for state management
- **Styling**: Dark mode fintech grey palette, Inter font family
- **Navigation**: 5 tabs (Home, Expenses, Insights, Cards, Profile)

## Key Features
- Dashboard with budget ring, daily/monthly spending, top categories
- Full expense CRUD with categories, tags, notes, recurring expenses
- Budget management with monthly/daily targets and history
- Insights with daily/monthly summaries, category breakdown, calendar heatmap
- Saved card management
- Savings goals tracker
- Activity log
- Profile with settings

## Project Structure
```
app/
  _layout.tsx         - Root layout with providers (BudgetProvider, QueryClient, fonts)
  (tabs)/
    _layout.tsx       - Tab navigation (5 tabs with liquid glass support)
    index.tsx         - Home/Dashboard
    expenses.tsx      - Expense list with search/filter
    insights.tsx      - Daily/Monthly/Calendar insights
    cards.tsx         - Saved cards management
    profile.tsx       - Profile, settings, activity log
  add-expense.tsx     - Modal: Add new expense
  edit-expense.tsx    - Modal: Edit existing expense
  add-card.tsx        - Modal: Add saved card
  budget-settings.tsx - Modal: Budget configuration
  add-goal.tsx        - Modal: Savings goals management

lib/
  types.ts           - TypeScript types and constants
  storage.ts         - AsyncStorage CRUD operations
  BudgetContext.tsx   - React Context for global state
  helpers.ts         - Formatting and utility functions
  query-client.ts    - React Query client setup

constants/
  colors.ts          - Dark theme color palette
```

## User Preferences
- Dark mode only interface
- Modern fintech grey color scheme
- Inter font family
- Easy navigation with tab bar
