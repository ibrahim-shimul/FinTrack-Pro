import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { formatCurrency, getCategoryColor, getCategoryIcon, formatDate, formatTime } from '@/lib/helpers';
import type { Expense, LoanEntry, FixedExpense } from '@/lib/types';

type TabType = 'daily' | 'fixed' | 'loans';

function ExpenseItem({ expense, currency, onDelete }: { expense: Expense; currency: string; onDelete: (id: string) => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.expenseItem, pressed && { backgroundColor: Colors.dark.surfaceElevated }]}
      onPress={() => router.push({ pathname: '/edit-expense', params: { id: expense.id } })}
      onLongPress={() => {
        Alert.alert('Delete Expense', `Remove "${expense.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense.id) },
        ]);
      }}
    >
      <View style={[styles.expenseIcon, { backgroundColor: getCategoryColor(expense.category) + '20' }]}>
        <Ionicons name={getCategoryIcon(expense.category) as any} size={20} color={getCategoryColor(expense.category)} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseName} numberOfLines={1}>{expense.name}</Text>
        <Text style={styles.expenseMeta}>
          {expense.category} {expense.tags.length > 0 ? `· ${expense.tags[0]}` : ''} 
        </Text>
        <Text style={styles.expenseDate}>{formatDate(expense.date)} · {formatTime(expense.createdAt)}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>-{formatCurrency(expense.amount, currency)}</Text>
        {expense.isRecurring && (
          <Ionicons name="repeat-outline" size={12} color={Colors.dark.textTertiary} style={{ marginTop: 4 }} />
        )}
      </View>
    </Pressable>
  );
}

function FixedExpenseItem({ expense, currency, onDelete }: { expense: FixedExpense; currency: string; onDelete: (id: string) => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.expenseItem, pressed && { backgroundColor: Colors.dark.surfaceElevated }]}
      onLongPress={() => {
        Alert.alert('Delete Fixed Expense', `Remove "${expense.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense.id) },
        ]);
      }}
    >
      <View style={[styles.expenseIcon, { backgroundColor: getCategoryColor(expense.category) + '20' }]}>
        <Ionicons name={getCategoryIcon(expense.category) as any} size={20} color={getCategoryColor(expense.category)} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseName} numberOfLines={1}>{expense.name}</Text>
        <Text style={styles.expenseMeta}>{expense.category}</Text>
        <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
      </View>
      <Text style={styles.fixedAmount}>{formatCurrency(expense.amount, currency)}</Text>
    </Pressable>
  );
}

function LoanItem({ loan, currency, onTogglePaid, onDelete }: { loan: LoanEntry; currency: string; onTogglePaid: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.expenseItem, pressed && { backgroundColor: Colors.dark.surfaceElevated }]}
      onPress={() => onTogglePaid(loan.id)}
      onLongPress={() => {
        Alert.alert('Delete Loan', `Remove "${loan.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(loan.id) },
        ]);
      }}
    >
      <View style={[styles.expenseIcon, { backgroundColor: loan.isPaid ? Colors.dark.success + '20' : '#FF6B6B20' }]}>
        <Ionicons name={loan.isPaid ? 'checkmark-circle-outline' : 'wallet-outline'} size={20} color={loan.isPaid ? Colors.dark.success : '#FF6B6B'} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={[styles.expenseName, loan.isPaid && { textDecorationLine: 'line-through' as const, color: Colors.dark.textTertiary }]} numberOfLines={1}>{loan.name}</Text>
        {loan.notes ? <Text style={styles.expenseMeta} numberOfLines={1}>{loan.notes}</Text> : null}
        <Text style={styles.expenseDate}>{formatDate(loan.date)} {loan.isPaid ? '· Paid' : '· Outstanding'}</Text>
      </View>
      <Text style={[styles.loanAmount, loan.isPaid && { color: Colors.dark.success }]}>
        {formatCurrency(loan.amount, currency)}
      </Text>
    </Pressable>
  );
}

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense, fixedExpenses, deleteFixedExpense, loans, updateLoan, deleteLoan, profile } = useBudget();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const dailyExpenses = useMemo(() => {
    return expenses.filter(e => (e.expenseType || 'daily') === 'daily');
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let filtered = dailyExpenses;
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(lower) ||
        e.category.toLowerCase().includes(lower) ||
        e.tags.some(t => t.toLowerCase().includes(lower)) ||
        e.notes.toLowerCase().includes(lower)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    return filtered;
  }, [dailyExpenses, search, selectedCategory]);

  const filteredFixed = useMemo(() => {
    if (!search) return fixedExpenses;
    const lower = search.toLowerCase();
    return fixedExpenses.filter(e =>
      e.name.toLowerCase().includes(lower) || e.category.toLowerCase().includes(lower)
    );
  }, [fixedExpenses, search]);

  const filteredLoans = useMemo(() => {
    if (!search) return loans;
    const lower = search.toLowerCase();
    return loans.filter(l =>
      l.name.toLowerCase().includes(lower) || l.notes.toLowerCase().includes(lower)
    );
  }, [loans, search]);

  const categories = useMemo(() => {
    const cats = new Set(dailyExpenses.map(e => e.category));
    return Array.from(cats);
  }, [dailyExpenses]);

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  const handleToggleLoanPaid = async (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      await updateLoan(id, {
        isPaid: !loan.isPaid,
        paidDate: !loan.isPaid ? new Date().toISOString() : undefined,
      });
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'fixed') {
      return (
        <FlatList
          data={filteredFixed}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FixedExpenseItem expense={item} currency={profile.currency} onDelete={deleteFixedExpense} />
          )}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.dark.textTertiary} />
              <Text style={styles.emptyText}>No fixed expenses</Text>
              <Text style={styles.emptySubtext}>Add rent, bills, subscriptions</Text>
            </View>
          }
        />
      );
    }

    if (activeTab === 'loans') {
      return (
        <FlatList
          data={filteredLoans}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LoanItem loan={item} currency={profile.currency} onTogglePaid={handleToggleLoanPaid} onDelete={deleteLoan} />
          )}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={Colors.dark.textTertiary} />
              <Text style={styles.emptyText}>No loans tracked</Text>
              <Text style={styles.emptySubtext}>Track borrowed money here</Text>
            </View>
          }
        />
      );
    }

    return (
      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} currency={profile.currency} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.dark.textTertiary} />
            <Text style={styles.emptyText}>
              {search || selectedCategory ? 'No matching expenses' : 'No expenses yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {search || selectedCategory ? 'Try a different search' : 'Add your first expense with the + button'}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Text style={styles.title}>Expenses</Text>

        <View style={styles.tabsRow}>
          {([
            { key: 'daily' as TabType, label: 'Daily', count: dailyExpenses.length },
            { key: 'fixed' as TabType, label: 'Fixed', count: fixedExpenses.length },
            { key: 'loans' as TabType, label: 'Loans', count: loans.length },
          ]).map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); setSelectedCategory(null); setSearch(''); }}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.dark.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.dark.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.dark.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        {activeTab === 'daily' && categories.length > 0 && (
          <FlatList
            horizontal
            data={['All', ...categories]}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedCategory(item === 'All' ? null : item)}
                style={[
                  styles.filterChip,
                  (item === 'All' && !selectedCategory) || selectedCategory === item
                    ? styles.filterChipActive
                    : null,
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  ((item === 'All' && !selectedCategory) || selectedCategory === item) && styles.filterChipTextActive,
                ]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>

      {renderTabContent()}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
        onPress={() => router.push('/add-expense')}
      >
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.dark.text,
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.dark.text,
    borderColor: Colors.dark.text,
  },
  tabText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: '#000',
  },
  tabBadge: {
    backgroundColor: Colors.dark.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.dark.textTertiary,
  },
  tabBadgeTextActive: {
    color: '#000',
  },
  searchRow: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.dark.text,
    height: 44,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.text,
    borderColor: Colors.dark.text,
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.dark.background,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.dark.text,
  },
  expenseMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
  expenseDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 1,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.dark.expense,
  },
  fixedAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#BB8FCE',
  },
  loanAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FF6B6B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textTertiary,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
