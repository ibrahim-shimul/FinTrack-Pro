import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { useAuth } from '@/lib/AuthContext';
import { formatCurrency, formatDate, formatTime } from '@/lib/helpers';
import { CURRENCY_OPTIONS } from '@/lib/types';

function SettingsRow({ icon, label, value, onPress, danger }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsRow, pressed && onPress && { backgroundColor: Colors.dark.surfaceElevated }]}
      onPress={onPress}
    >
      <View style={styles.settingsLeft}>
        <Ionicons name={icon as any} size={20} color={danger ? Colors.dark.danger : Colors.dark.textSecondary} />
        <Text style={[styles.settingsLabel, danger && { color: Colors.dark.danger }]}>{label}</Text>
      </View>
      <View style={styles.settingsRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.dark.textTertiary} />}
      </View>
    </Pressable>
  );
}

function ActivityLogItem({ item, currency }: { item: any; currency: string }) {
  const getIcon = () => {
    switch (item.type) {
      case 'expense_added': return 'add-circle-outline';
      case 'expense_edited': return 'create-outline';
      case 'expense_deleted': return 'trash-outline';
      case 'budget_updated': return 'wallet-outline';
      case 'card_added': return 'card-outline';
      case 'card_deleted': return 'card-outline';
      case 'goal_added': return 'flag-outline';
      case 'goal_updated': return 'flag-outline';
      default: return 'ellipsis-horizontal-outline';
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons name={getIcon() as any} size={16} color={Colors.dark.textSecondary} />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityDesc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.activityDate}>{formatDate(item.date)} {formatTime(item.date)}</Text>
      </View>
      {item.amount !== undefined && (
        <Text style={styles.activityAmount}>{formatCurrency(item.amount, currency)}</Text>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, activityLog, savingsGoals, expenses } = useBudget();
  const { user, logout, changePassword } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showActivity, setShowActivity] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const handleCurrencyChange = () => {
    const currentIndex = CURRENCY_OPTIONS.indexOf(profile.currency);
    const nextIndex = (currentIndex + 1) % CURRENCY_OPTIONS.length;
    updateProfile({ currency: CURRENCY_OPTIONS[nextIndex] });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
  };

  const handlePasswordChange = async () => {
    if (!currentPwd || !newPwd) {
      setPwdError('Please fill in both fields');
      return;
    }
    if (newPwd.length < 4) {
      setPwdError('New password must be at least 4 characters');
      return;
    }
    setPwdError('');
    setPwdSuccess('');
    setPwdLoading(true);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdSuccess('Password updated successfully');
      setCurrentPwd('');
      setNewPwd('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPwdSuccess('');
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('401')) {
        setPwdError('Current password is incorrect');
      } else {
        setPwdError('Password change failed');
      }
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + webTopInset + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(profile.name || 'U')[0].toUpperCase()}
            </Text>
          </View>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                onSubmitEditing={handleSaveName}
                placeholderTextColor={Colors.dark.textTertiary}
              />
              <Pressable onPress={handleSaveName}>
                <Ionicons name="checkmark" size={24} color={Colors.dark.success} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setNameInput(profile.name); setEditingName(true); }}>
              <Text style={styles.profileName}>{profile.name}</Text>
            </Pressable>
          )}
          {user && (
            <Text style={styles.usernameLabel}>@{user.username}</Text>
          )}
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{expenses.length}</Text>
              <Text style={styles.profileStatLabel}>Expenses</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{savingsGoals.length}</Text>
              <Text style={styles.profileStatLabel}>Goals</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{formatCurrency(profile.monthlyBudget, profile.currency)}</Text>
              <Text style={styles.profileStatLabel}>Budget</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="wallet-outline"
              label="Monthly Budget"
              value={profile.monthlyBudget > 0 ? formatCurrency(profile.monthlyBudget, profile.currency) : 'Not set'}
              onPress={() => router.push('/budget-settings')}
            />
            <SettingsRow
              icon="today-outline"
              label="Daily Target"
              value={profile.dailyBudgetTarget > 0 ? formatCurrency(profile.dailyBudgetTarget, profile.currency) : 'Not set'}
              onPress={() => router.push('/budget-settings')}
            />
            <SettingsRow
              icon="cash-outline"
              label="Currency"
              value={profile.currency}
              onPress={handleCurrencyChange}
            />
            <SettingsRow
              icon="flag-outline"
              label="Savings Goals"
              value={`${savingsGoals.length} active`}
              onPress={() => router.push('/add-goal')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="key-outline"
              label="Change Password"
              onPress={() => setShowPasswordChange(!showPasswordChange)}
            />
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {showPasswordChange && (
          <View style={styles.passwordSection}>
            {pwdError ? (
              <View style={styles.pwdErrorBox}>
                <Ionicons name="alert-circle" size={14} color={Colors.dark.danger} />
                <Text style={styles.pwdErrorText}>{pwdError}</Text>
              </View>
            ) : null}
            {pwdSuccess ? (
              <View style={styles.pwdSuccessBox}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.dark.success} />
                <Text style={styles.pwdSuccessText}>{pwdSuccess}</Text>
              </View>
            ) : null}
            <View style={styles.pwdInputContainer}>
              <TextInput
                style={styles.pwdInput}
                placeholder="Current password"
                placeholderTextColor={Colors.dark.textTertiary}
                value={currentPwd}
                onChangeText={setCurrentPwd}
                secureTextEntry
              />
            </View>
            <View style={styles.pwdInputContainer}>
              <TextInput
                style={styles.pwdInput}
                placeholder="New password"
                placeholderTextColor={Colors.dark.textTertiary}
                value={newPwd}
                onChangeText={setNewPwd}
                secureTextEntry
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.pwdButton, pressed && { opacity: 0.85 }]}
              onPress={handlePasswordChange}
              disabled={pwdLoading}
            >
              <Text style={styles.pwdButtonText}>{pwdLoading ? 'Updating...' : 'Update Password'}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Pressable onPress={() => setShowActivity(!showActivity)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Log</Text>
            <Ionicons name={showActivity ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.dark.textSecondary} />
          </Pressable>
          {showActivity && (
            activityLog.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No activity yet</Text>
              </View>
            ) : (
              activityLog.slice(0, 20).map(item => (
                <ActivityLogItem key={item.id} item={item} currency={profile.currency} />
              ))
            )
          )}
        </View>
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
    marginBottom: 20,
  },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.dark.text,
  },
  profileName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  usernameLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.dark.textTertiary,
    marginBottom: 16,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  nameInput: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.dark.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.textSecondary,
    paddingVertical: 4,
    minWidth: 150,
    textAlign: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.dark.text,
  },
  profileStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.dark.text,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  passwordSection: {
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  pwdInputContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: 48,
  },
  pwdInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.dark.text,
    height: 48,
    paddingHorizontal: 14,
  },
  pwdButton: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pwdButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.text,
  },
  pwdErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.danger + '15',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pwdErrorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.dark.danger,
  },
  pwdSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.success + '15',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pwdSuccessText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.dark.success,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.text,
  },
  activityDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
  activityAmount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.dark.textTertiary,
  },
});
