import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { restaurantService } from '../services/api';
import { RestaurantDetails, MenuCategory, MenuItem } from '../types/api';
import { filterMenuItemsByName } from '../utils/searchFilter';

interface RestaurantScreenProps {
  route: {
    params: {
      slug: string;
    };
  };
  navigation: any;
}

export default function RestaurantScreen({ route, navigation }: RestaurantScreenProps) {
  const { slug } = route.params;
  const [restaurantData, setRestaurantData] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRestaurantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantService.getRestaurantBySlug(slug);
      setRestaurantData(data);
    } catch (err) {
      setError('Failed to load restaurant menu. Please try again.');
      console.error('Error loading restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCategories = (): MenuCategory[] => {
    if (!restaurantData || !searchQuery.trim()) {
      return restaurantData?.menu.categories || [];
    }

    return restaurantData.menu.categories
      .map((category) => ({
        ...category,
        items: filterMenuItemsByName(category.items, searchQuery),
      }))
      .filter((category) => category.items.length > 0);
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.menuItemHeader}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      {item.description && (
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      )}
      {!item.isAvailable && (
        <Text style={styles.unavailableLabel}>Currently Unavailable</Text>
      )}
    </View>
  );

  const renderCategory = (category: MenuCategory) => (
    <View key={category.id} style={styles.category}>
      <Text style={styles.categoryName}>{category.name}</Text>
      {category.items.map(renderMenuItem)}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error || !restaurantData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRestaurantData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredCategories = getFilteredCategories();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>{restaurantData.restaurant.name}</Text>
        <Text style={styles.menuName}>{restaurantData.menu.name}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map(renderCategory)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items match your search' : 'No menu items available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuName: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  category: {
    marginBottom: 24,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  unavailableLabel: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '500',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
