import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense, BudgetHistory, SavingsGoal, SavedCard, ActivityItem, UserProfile } from './types';

const KEYS = {
  EXPENSES: '@budgetflow_expenses',
  BUDGET_HISTORY: '@budgetflow_budget_history',
  SAVINGS_GOALS: '@budgetflow_savings_goals',
  SAVED_CARDS: '@budgetflow_saved_cards',
  ACTIVITY_LOG: '@budgetflow_activity_log',
  USER_PROFILE: '@budgetflow_user_profile',
  SHOPPING_LIST: '@budgetflow_shopping_list',
};

async function getItem<T>(key: string, fallback: T): Promise<T> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function getExpenses(): Promise<Expense[]> {
  return getItem<Expense[]>(KEYS.EXPENSES, []);
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const expenses = await getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  expenses.unshift(newExpense);
  await setItem(KEYS.EXPENSES, expenses);
  await addActivity({
    type: 'expense_added',
    description: `Added expense: ${expense.name}`,
    amount: expense.amount,
  });
  return newExpense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
  const expenses = await getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return null;
  expenses[index] = { ...expenses[index], ...updates };
  await setItem(KEYS.EXPENSES, expenses);
  await addActivity({
    type: 'expense_edited',
    description: `Edited expense: ${expenses[index].name}`,
    amount: expenses[index].amount,
  });
  return expenses[index];
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();
  const expense = expenses.find(e => e.id === id);
  const filtered = expenses.filter(e => e.id !== id);
  await setItem(KEYS.EXPENSES, filtered);
  if (expense) {
    await addActivity({
      type: 'expense_deleted',
      description: `Deleted expense: ${expense.name}`,
      amount: expense.amount,
    });
  }
}

export async function getBudgetHistory(): Promise<BudgetHistory[]> {
  return getItem<BudgetHistory[]>(KEYS.BUDGET_HISTORY, []);
}

export async function addBudgetHistory(amount: number): Promise<void> {
  const history = await getBudgetHistory();
  history.unshift({ id: generateId(), amount, date: new Date().toISOString() });
  await setItem(KEYS.BUDGET_HISTORY, history);
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return getItem<SavingsGoal[]>(KEYS.SAVINGS_GOALS, []);
}

export async function addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<SavingsGoal> {
  const goals = await getSavingsGoals();
  const newGoal: SavingsGoal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
  goals.push(newGoal);
  await setItem(KEYS.SAVINGS_GOALS, goals);
  await addActivity({ type: 'goal_added', description: `Added goal: ${goal.name}`, amount: goal.targetAmount });
  return newGoal;
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
  const goals = await getSavingsGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    await setItem(KEYS.SAVINGS_GOALS, goals);
    await addActivity({ type: 'goal_updated', description: `Updated goal: ${goals[index].name}` });
  }
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const goals = await getSavingsGoals();
  await setItem(KEYS.SAVINGS_GOALS, goals.filter(g => g.id !== id));
}

export async function getSavedCards(): Promise<SavedCard[]> {
  return getItem<SavedCard[]>(KEYS.SAVED_CARDS, []);
}

export async function addSavedCard(card: Omit<SavedCard, 'id'>): Promise<SavedCard> {
  const cards = await getSavedCards();
  const newCard: SavedCard = { ...card, id: generateId() };
  cards.push(newCard);
  await setItem(KEYS.SAVED_CARDS, cards);
  await addActivity({ type: 'card_added', description: `Added card: ${card.cardName}` });
  return newCard;
}

export async function deleteSavedCard(id: string): Promise<void> {
  const cards = await getSavedCards();
  const card = cards.find(c => c.id === id);
  await setItem(KEYS.SAVED_CARDS, cards.filter(c => c.id !== id));
  if (card) {
    await addActivity({ type: 'card_deleted', description: `Removed card: ${card.cardName}` });
  }
}

export async function getActivityLog(): Promise<ActivityItem[]> {
  return getItem<ActivityItem[]>(KEYS.ACTIVITY_LOG, []);
}

export async function addActivity(item: Omit<ActivityItem, 'id' | 'date'>): Promise<void> {
  const log = await getActivityLog();
  log.unshift({ ...item, id: generateId(), date: new Date().toISOString() });
  if (log.length > 200) log.length = 200;
  await setItem(KEYS.ACTIVITY_LOG, log);
}

export async function getUserProfile(): Promise<UserProfile> {
  return getItem<UserProfile>(KEYS.USER_PROFILE, {
    name: 'User',
    currency: '$',
    monthlyBudget: 0,
    dailyBudgetTarget: 0,
  });
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getUserProfile();
  const updated = { ...current, ...profile };
  await setItem(KEYS.USER_PROFILE, updated);
  if (profile.monthlyBudget !== undefined && profile.monthlyBudget !== current.monthlyBudget) {
    await addBudgetHistory(profile.monthlyBudget);
    await addActivity({ type: 'budget_updated', description: `Budget updated to ${profile.monthlyBudget}`, amount: profile.monthlyBudget });
  }
  return updated;
}

export async function getShoppingList(): Promise<string[]> {
  return getItem<string[]>(KEYS.SHOPPING_LIST, []);
}

export async function setShoppingList(list: string[]): Promise<void> {
  await setItem(KEYS.SHOPPING_LIST, list);
}
