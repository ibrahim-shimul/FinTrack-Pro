# Expense Daddy - Personal Budget & Expenses Tracker

## Overview
A local-first personal budget and expenses tracker mobile app built with Expo (React Native) and Express backend. Features a dark-mode-only fintech UI with modern Inter font, grey color palette. Uses Bangladeshi Taka (৳) as default currency. No authentication required - all data stored locally with export/import for backup.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server on port 5000 (landing page only, minimal)
- **Data**: All data stored locally via AsyncStorage (no server database needed for app data)
- **State**: AsyncStorage for persistent data, React Context (BudgetContext) for state management
- **Styling**: Dark mode fintech grey palette (#0A0A0A background), Inter font family
- **Navigation**: 5 tabs (Home, Expenses, Insights, Cards, Profile)
- **Backup**: Export all data as JSON file, Import to restore from backup

## Key Features
- Dashboard with budget ring, daily/monthly spending, top categories
- Full expense CRUD with categories, tags, notes, recurring expenses
- Budget management with monthly/daily targets and history
- Insights with daily/monthly summaries, category breakdown, calendar heatmap
- Saved card management
- Savings goals tracker
- Activity log
- Profile with settings, data export/import
- No authentication needed - fully local app

## Project Structure
```
app/
  _layout.tsx         - Root layout with BudgetProvider (no auth)
  (tabs)/
    _layout.tsx       - Tab navigation (5 tabs with liquid glass support)
    index.tsx         - Home/Dashboard
    expenses.tsx      - Expense list with search/filter
    insights.tsx      - Daily/Monthly/Calendar insights
    cards.tsx         - Saved cards management
    profile.tsx       - Profile, settings, data export/import, activity log
  add-expense.tsx     - Modal: Add new expense
  edit-expense.tsx    - Modal: Edit existing expense
  add-card.tsx        - Modal: Add saved card
  budget-settings.tsx - Modal: Budget configuration
  add-goal.tsx        - Modal: Savings goals management

lib/
  types.ts           - TypeScript types and constants
  storage.ts         - AsyncStorage CRUD operations + export/import
  BudgetContext.tsx   - React Context for budget/expense state (local only)
  helpers.ts         - Formatting and utility functions
  query-client.ts    - React Query client setup

server/
  index.ts           - Express server setup
  routes.ts          - Minimal routes (no auth)

constants/
  colors.ts          - Dark theme color palette
```

## User Preferences
- Dark mode only interface
- Modern fintech grey color scheme
- Inter font family
- Easy navigation with tab bar
- Bangladeshi Taka (৳) as default currency
- No authentication - fully local data
- Export/Import JSON backup for data portability
