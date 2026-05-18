import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

export default function App() {
  const getTotalItems = useCartStore((s) => s.getTotalItems);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
              borderTopWidth: 1,
              paddingBottom: 8,
              paddingTop: 8,
              height: 64,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
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
              tabBarBadge: getTotalItems() > 0 ? getTotalItems() : undefined,
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
