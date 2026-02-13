import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { formatCurrency, getCategoryColor, getCategoryIcon, formatDate, formatTime } from '@/lib/helpers';
import type { Expense } from '@/lib/types';

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

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense, profile } = useBudget();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
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
  }, [expenses, search, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return Array.from(cats);
  }, [expenses]);

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Text style={styles.title}>Expenses</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.dark.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search expenses..."
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
        {categories.length > 0 && (
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
