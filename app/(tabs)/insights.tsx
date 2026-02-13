import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { formatCurrency, getCategoryColor, getDaysInMonth, getFirstDayOfMonth } from '@/lib/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS = ['Daily', 'Monthly', 'Calendar'] as const;

function CategoryBar({ name, amount, total, currency }: { name: string; amount: number; total: number; currency: string }) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={styles.categoryBar}>
      <View style={styles.categoryBarHeader}>
        <View style={styles.categoryBarLeft}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(name) }]} />
          <Text style={styles.categoryBarName}>{name}</Text>
        </View>
        <Text style={styles.categoryBarAmount}>{formatCurrency(amount, currency)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: getCategoryColor(name) }]} />
      </View>
      <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
    </View>
  );
}

function WeeklyChart({ data, currency }: { data: { day: string; amount: number }[]; currency: string }) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((item, i) => (
          <View key={i} style={styles.chartBarWrapper}>
            <View style={styles.chartBarContainer}>
              <View style={[styles.chartBar, {
                height: `${Math.max((item.amount / maxAmount) * 100, 4)}%`,
                backgroundColor: item.amount > 0 ? Colors.dark.textSecondary : Colors.dark.surfaceHighlight,
              }]} />
            </View>
            <Text style={styles.chartLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CalendarView({ expenses, year, month, currency }: { expenses: any[]; year: number; month: number; currency: string }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const dailyTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        totals[day] = (totals[day] || 0) + e.amount;
      }
    });
    return totals;
  }, [expenses, year, month]);

  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<View key={`empty-${i}`} style={styles.calCell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const spent = dailyTotals[d] || 0;
    const intensity = spent > 0 ? Math.max(0.15, spent / maxDaily) : 0;
    const isToday = isCurrentMonth && today.getDate() === d;
    cells.push(
      <View key={d} style={[styles.calCell, isToday && styles.calCellToday]}>
        <Text style={[styles.calDay, isToday && styles.calDayToday]}>{d}</Text>
        {spent > 0 && (
          <View style={[styles.calDot, { opacity: intensity, backgroundColor: Colors.dark.expense }]} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calHeader}>
        {dayNames.map(d => (
          <View key={d} style={styles.calCell}>
            <Text style={styles.calHeaderText}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calGrid}>{cells}</View>
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, monthExpenses, todayExpenses, todayTotal, monthTotal, profile } = useBudget();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Daily');
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const categoryBreakdown = useMemo(() => {
    const catMap: Record<string, number> = {};
    monthExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => ({ name, amount }));
  }, [monthExpenses]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    return days.map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const amount = expenses
        .filter(e => e.date.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      return { day, amount };
    });
  }, [expenses]);

  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + webTopInset + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Insights</Text>

        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'Daily' && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Today's Spending</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(todayTotal, profile.currency)}</Text>
              <Text style={styles.summarySubtext}>
                {todayExpenses.length} transaction{todayExpenses.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <WeeklyChart data={weeklyData} currency={profile.currency} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Breakdown</Text>
              {todayExpenses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="leaf-outline" size={32} color={Colors.dark.success} />
                  <Text style={styles.emptyText}>No spending today</Text>
                </View>
              ) : (
                todayExpenses.map(e => (
                  <View key={e.id} style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, { backgroundColor: getCategoryColor(e.category) }]} />
                    <Text style={styles.breakdownName}>{e.name}</Text>
                    <Text style={styles.breakdownAmount}>{formatCurrency(e.amount, profile.currency)}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {activeTab === 'Monthly' && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Monthly Spending</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(monthTotal, profile.currency)}</Text>
              {profile.monthlyBudget > 0 && (
                <Text style={styles.summarySubtext}>
                  {formatCurrency(profile.monthlyBudget - monthTotal, profile.currency)} remaining of {formatCurrency(profile.monthlyBudget, profile.currency)}
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {categoryBreakdown.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="pie-chart-outline" size={32} color={Colors.dark.textTertiary} />
                  <Text style={styles.emptyText}>No data this month</Text>
                </View>
              ) : (
                categoryBreakdown.map(cat => (
                  <CategoryBar
                    key={cat.name}
                    name={cat.name}
                    amount={cat.amount}
                    total={monthTotal}
                    currency={profile.currency}
                  />
                ))
              )}
            </View>

            {categoryBreakdown.length >= 3 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top 3 Categories</Text>
                <View style={styles.topCategoriesRow}>
                  {categoryBreakdown.slice(0, 3).map((cat, i) => (
                    <View key={cat.name} style={styles.topCategoryCard}>
                      <Text style={styles.topCategoryRank}>#{i + 1}</Text>
                      <View style={[styles.topCategoryDot, { backgroundColor: getCategoryColor(cat.name) }]} />
                      <Text style={styles.topCategoryName}>{cat.name}</Text>
                      <Text style={styles.topCategoryAmount}>{formatCurrency(cat.amount, profile.currency)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'Calendar' && (
          <>
            <View style={styles.calNavRow}>
              <Pressable onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
              <Text style={styles.calMonthTitle}>{monthName}</Text>
              <Pressable onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>
            <CalendarView expenses={expenses} year={calYear} month={calMonth} currency={profile.currency} />
            <View style={styles.calLegend}>
              <View style={styles.calLegendItem}>
                <View style={[styles.calLegendDot, { backgroundColor: Colors.dark.expense, opacity: 0.3 }]} />
                <Text style={styles.calLegendText}>Low spending</Text>
              </View>
              <View style={styles.calLegendItem}>
                <View style={[styles.calLegendDot, { backgroundColor: Colors.dark.expense }]} />
                <Text style={styles.calLegendText}>High spending</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.dark.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.dark.surfaceHighlight,
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.textTertiary,
  },
  tabTextActive: {
    color: Colors.dark.text,
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.dark.text,
  },
  summarySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textTertiary,
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 14,
  },
  categoryBar: {
    marginBottom: 16,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryBarName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.text,
  },
  categoryBarAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.dark.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryPercent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 4,
  },
  topCategoriesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  topCategoryCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  topCategoryRank: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.dark.textTertiary,
  },
  topCategoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  topCategoryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.dark.text,
  },
  topCategoryAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  chartContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarContainer: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.dark.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  breakdownName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.text,
  },
  breakdownAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  calMonthTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.dark.text,
  },
  calendarContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  calHeader: {
    flexDirection: 'row',
  },
  calHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.dark.textTertiary,
    textAlign: 'center',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  calCellToday: {
    backgroundColor: Colors.dark.surfaceHighlight,
    borderRadius: 8,
  },
  calDay: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  calDayToday: {
    color: Colors.dark.text,
    fontFamily: 'Inter_600SemiBold',
  },
  calDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  calLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  calLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calLegendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.dark.textTertiary,
  },
});
