import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Platform, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { CATEGORIES } from '@/lib/types';
import { getCategoryColor } from '@/lib/helpers';

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const { addExpense, profile } = useBudget();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [saving, setSaving] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!name.trim() || !amount.trim()) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setSaving(true);
    try {
      await addExpense({
        name: name.trim(),
        amount: amountNum,
        category,
        tags,
        notes: notes.trim(),
        date: new Date().toISOString(),
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (e) {
      setSaving(false);
    }
  };

  const isValid = name.trim().length > 0 && amount.trim().length > 0 && parseFloat(amount) > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <Pressable
          onPress={handleSave}
          disabled={!isValid || saving}
          style={({ pressed }) => [{ opacity: isValid && !saving ? (pressed ? 0.7 : 1) : 0.3 }]}
        >
          <Ionicons name="checkmark" size={26} color={Colors.dark.success} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySign}>{profile.currency}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.dark.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Groceries, Coffee..."
            placeholderTextColor={Colors.dark.textTertiary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.name}
                onPress={() => {
                  setCategory(cat.name);
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                }}
                style={[
                  styles.categoryOption,
                  category === cat.name && { borderColor: getCategoryColor(cat.name), backgroundColor: getCategoryColor(cat.name) + '15' },
                ]}
              >
                <Ionicons name={cat.icon as any} size={18} color={category === cat.name ? getCategoryColor(cat.name) : Colors.dark.textSecondary} />
                <Text style={[styles.categoryName, category === cat.name && { color: getCategoryColor(cat.name) }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tags</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag..."
              placeholderTextColor={Colors.dark.textTertiary}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <Pressable onPress={handleAddTag} style={styles.tagAddBtn}>
              <Ionicons name="add" size={20} color={Colors.dark.text} />
            </Pressable>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map(tag => (
                <Pressable key={tag} onPress={() => handleRemoveTag(tag)} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons name="close" size={12} color={Colors.dark.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor={Colors.dark.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <Ionicons name="repeat-outline" size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.switchLabel}>Recurring Expense</Text>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: Colors.dark.surfaceHighlight, true: Colors.dark.success + '50' }}
            thumbColor={isRecurring ? Colors.dark.success : Colors.dark.textTertiary}
          />
        </View>

        {isRecurring && (
          <View style={styles.recurringOptions}>
            {(['daily', 'weekly', 'monthly'] as const).map(type => (
              <Pressable
                key={type}
                onPress={() => setRecurringType(type)}
                style={[styles.recurringOption, recurringType === type && styles.recurringOptionActive]}
              >
                <Text style={[styles.recurringOptionText, recurringType === type && styles.recurringOptionTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: Colors.dark.text,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  amountLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySign: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.dark.textTertiary,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: Colors.dark.text,
    minWidth: 100,
    textAlign: 'center',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  categoryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 12,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.dark.text,
  },
  recurringOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  recurringOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  recurringOptionActive: {
    backgroundColor: Colors.dark.text,
    borderColor: Colors.dark.text,
  },
  recurringOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  recurringOptionTextActive: {
    color: Colors.dark.background,
  },
});
