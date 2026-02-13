import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useBudget } from '@/lib/BudgetContext';
import { maskCardNumber } from '@/lib/helpers';
import type { SavedCard } from '@/lib/types';

function CardItem({ card, onDelete }: { card: SavedCard; onDelete: (id: string) => void }) {
  const getCardColors = (): [string, string] => {
    switch (card.cardType) {
      case 'visa': return ['#1A1A2E', '#2D2D44'];
      case 'mastercard': return ['#2A1A1A', '#442D2D'];
      case 'amex': return ['#1A2A1A', '#2D442D'];
      default: return ['#1C1C1C', '#2C2C2C'];
    }
  };

  const getCardIcon = () => {
    switch (card.cardType) {
      case 'visa': return 'card';
      case 'mastercard': return 'card';
      case 'amex': return 'card';
      default: return 'card-outline';
    }
  };

  return (
    <Pressable
      onLongPress={() => {
        Alert.alert('Remove Card', `Remove "${card.cardName}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => onDelete(card.id) },
        ]);
      }}
    >
      <LinearGradient
        colors={getCardColors()}
        style={styles.cardItem}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{card.cardName}</Text>
          <Ionicons name={getCardIcon() as any} size={24} color={Colors.dark.textSecondary} />
        </View>
        <View style={styles.cardChip}>
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
        </View>
        <Text style={styles.cardNumberDisplay}>{maskCardNumber(card.cardNumber)}</Text>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardFooterLabel}>Expires</Text>
            <Text style={styles.cardFooterValue}>{card.expiryDate}</Text>
          </View>
          <View style={styles.cardTypeContainer}>
            <Text style={styles.cardTypeText}>{card.cardType.toUpperCase()}</Text>
          </View>
        </View>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { savedCards, deleteSavedCard } = useBudget();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleDelete = async (id: string) => {
    await deleteSavedCard(id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerArea, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Text style={styles.title}>My Cards</Text>
        <Pressable onPress={() => router.push('/add-card')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.dark.text} />
        </Pressable>
      </View>

      <FlatList
        data={savedCards}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CardItem card={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="card-outline" size={48} color={Colors.dark.textTertiary} />
            </View>
            <Text style={styles.emptyText}>No cards saved</Text>
            <Text style={styles.emptySubtext}>Save your card information for quick reference</Text>
            <Pressable
              style={({ pressed }) => [styles.addCardBtn, pressed && { opacity: 0.8 }]}
              onPress={() => router.push('/add-card')}
            >
              <Ionicons name="add" size={20} color={Colors.dark.background} />
              <Text style={styles.addCardBtnText}>Add Card</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.dark.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardItem: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.dark.text,
  },
  cardChip: {
    width: 40,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
    marginVertical: 16,
  },
  chipLine: {
    height: 2,
    backgroundColor: '#555',
    borderRadius: 1,
  },
  cardNumberDisplay: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.dark.text,
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFooterLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.dark.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardFooterValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  cardTypeContainer: {
    backgroundColor: Colors.dark.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTypeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.dark.success + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.dark.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    textAlign: 'center',
    maxWidth: 250,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  addCardBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.dark.background,
  },
});
