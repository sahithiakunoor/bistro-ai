import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./src/constants/colors";
import { useCartStore } from "./src/store/cartStore";
import MenuScreen from "./src/screens/MenuScreen";
import ChatScreen from "./src/screens/ChatScreen";
import CartScreen from "./src/screens/CartScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain" component={MenuScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain" component={ChatScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  const totalCartItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const insets = useSafeAreaInsets();

  // Reserve content height for icon + label, then add the system inset below.
  const tabContentHeight = 56;
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPad,
          height: tabContentHeight + bottomPad,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarLabel: "Menu",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: "AI Chat",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "bag" : "bag-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarBadge: totalCartItems > 0 ? totalCartItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.badge,
            fontSize: 10,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
