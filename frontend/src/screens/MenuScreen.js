import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useMenuStore } from "../store/menuStore";
import { useCartStore } from "../store/cartStore";
import CategoryPill from "../components/CategoryPill";
import MenuItemCard from "../components/MenuItemCard";

export default function MenuScreen({ navigation }) {
  const { categories, loading, error, fetchMenu } = useMenuStore();
  const { getTotalItems } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const totalItems = getTotalItems();

  useEffect(() => {
    fetchMenu();
  }, []);

  const allCategories = useMemo(
    () => [{ id: null, name: "All", icon: "✨" }, ...categories],
    [categories]
  );

  const displayedItems = useMemo(() => {
    let items = categories.flatMap((c) => c.items);
    if (selectedCategory) {
      items = categories.find((c) => c.id === selectedCategory)?.items || [];
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    // Exclude popular items from main list when showing the default view —
    // they already appear in the pinned Popular section header.
    if (!selectedCategory && !search.trim()) {
      items = items.filter((i) => !i.popular);
    }
    return items;
  }, [categories, selectedCategory, search]);

  const popularItems = useMemo(
    () => categories.flatMap((c) => c.items).filter((i) => i.popular),
    [categories]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading menu…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Could not load menu</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchMenu}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🍽️ Bistro AI</Text>
          <Text style={styles.subtitle}>What are you craving?</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="bag-outline" size={22} color={COLORS.text} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes, ingredients…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {allCategories.map((cat) => (
            <CategoryPill
              key={cat.id ?? "all"}
              category={cat}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Items */}
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        }
        ListHeaderComponent={
          !search && !selectedCategory && popularItems.length > 0 ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Popular Right Now</Text>
              </View>
              {popularItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 Full Menu</Text>
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  cartBtn: {
    position: "relative",
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.badge,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  categoriesWrapper: { overflow: "visible" },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "700" },
  list: { paddingTop: 4, paddingBottom: 100 },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  errorEmoji: { fontSize: 40 },
  errorText: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  errorSub: { color: COLORS.textSecondary, fontSize: 13 },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryText: { color: COLORS.background, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
});
