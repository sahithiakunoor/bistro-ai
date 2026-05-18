import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useCartStore } from "../store/cartStore";
import CartItem from "../components/CartItem";

export default function CartScreen({ navigation }) {
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [ordered, setOrdered] = useState(false);
  const total = getTotalPrice();
  const count = getTotalItems();
  const tax = total * 0.08;
  const grandTotal = total + tax;

  const handleClear = () => {
    Alert.alert("Clear Cart", "Remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearCart },
    ]);
  };

  const handleOrder = () => {
    setOrdered(true);
    clearCart();
  };

  if (ordered) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.success}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>
            Your food is being prepared. Estimated time: 20–30 minutes.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setOrdered(false);
              navigation.navigate("Menu");
            }}
          >
            <Text style={styles.backBtnText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Order</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from the menu or ask the AI assistant</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Menu")}>
            <Text style={styles.shopBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <CartItem item={item} />}
            style={styles.list}
          />
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({count} items)</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.background} />
              <Text style={styles.orderBtnText}>Place Order · ${grandTotal.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backIcon: { marginRight: 12 },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: "700" },
  clearText: { color: COLORS.error, fontSize: 14 },
  list: { flex: 1 },
  summary: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 14 },
  summaryValue: { color: COLORS.text, fontSize: 14 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  totalValue: { color: COLORS.primary, fontSize: 20, fontWeight: "800" },
  orderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  orderBtnText: { color: COLORS.background, fontSize: 16, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  emptySub: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  shopBtnText: { color: COLORS.background, fontWeight: "700", fontSize: 15 },
  success: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  successEmoji: { fontSize: 80 },
  successTitle: { color: COLORS.text, fontSize: 28, fontWeight: "800" },
  successSub: { color: COLORS.textSecondary, fontSize: 15, textAlign: "center", lineHeight: 22 },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  backBtnText: { color: COLORS.background, fontWeight: "700", fontSize: 15 },
});
