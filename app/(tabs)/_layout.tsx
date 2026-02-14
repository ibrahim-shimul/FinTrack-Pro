import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import React from "react";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expenses">
        <Icon sf={{ default: "list.bullet", selected: "list.bullet" }} />
        <Label>Expenses</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cards">
        <Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} />
        <Label>Cards</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function AnimatedTabIcon({ name, focusedName, color, focused, size }: { name: string; focusedName: string; color: string; focused: boolean; size: number }) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withTiming(focused ? 1.15 : 1, { duration: 200, easing: Easing.out(Easing.cubic) }) },
      { translateY: withTiming(focused ? -2 : 0, { duration: 200, easing: Easing.out(Easing.cubic) }) },
    ],
    opacity: withTiming(focused ? 1 : 0.5, { duration: 200 }),
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={(focused ? focusedName : name) as any} size={size} color={color} />
    </Animated.View>
  );
}

function ClassicTabLayout() {
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#555555',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "rgba(12, 12, 12, 0.98)",
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 70 + insets.bottom,
          paddingBottom: isWeb ? 34 : insets.bottom + 6,
          paddingTop: 8,
          paddingHorizontal: 8,
          ...(isWeb ? {} : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
          }),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, {
              backgroundColor: 'rgba(12, 12, 12, 0.98)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.06)',
            }]} />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home-outline" focusedName="home" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="receipt-outline" focusedName="receipt" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="stats-chart-outline" focusedName="stats-chart" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="card-outline" focusedName="card" color={color} focused={focused} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="person-outline" focusedName="person" color={color} focused={focused} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
