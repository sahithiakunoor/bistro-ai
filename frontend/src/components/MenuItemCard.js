import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useCartStore } from "../store/cartStore";

const ITEM_ICONS = {
  bruschetta: "🍞",
  calamari: "🦑",
  soup: "🍲",
  wings: "🍗",
  salmon: "🐟",
  steak: "🥩",
  chicken_sandwich: "🍔",
  risotto: "🍚",
  pizza: "🍕",
  tacos: "🌮",
  fries: "🍟",
  onion_rings: "🧅",
  salad: "🥗",
  garlic_bread: "🥖",
  lemonade: "🍋",
  water: "💧",
  wine: "🍷",
  beer: "🍺",
  coffee: "☕",
  lava_cake: "🍫",
  creme_brulee: "🍮",
  tiramisu: "🍰",
};

export default function MenuItemCard({ item, onPress }) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity || 0;
  const icon = ITEM_ICONS[item.image] || "🍽️";

  const handleAdd = useCallback(() => {
    addItem(item, 1);
  }, [item, addItem]);

  const handleDecrement = useCallback(() => {
    if (qty <= 1) removeItem(item.id);
    else updateQuantity(item.id, qty - 1);
  }, [item.id, qty, removeItem, updateQuantity]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconBox}>
        <Text style={styles.emoji}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {qty > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
                <Ionicons name="remove" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleAdd}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Ionicons name="add" size={18} color={COLORS.background} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 40,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  popularBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "700",
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  price: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
});
