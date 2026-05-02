import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,

  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useProducts, MAX_PRODUCTS } from '../context/ProductContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { state, canAddMore } = useProducts();
  const { products } = state;

  const handleAdd = () => {
    if (!canAddMore) return;
    navigation.navigate('AddProduct', {});
  };

  const categories = ['All Products', 'Electronics', 'Fashion', 'Home', 'Beauty'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Products &{"\n"}Inventory</Text>
          </View>
        </View>

        {/* Search Bar Mockup */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              placeholder="Search your products..." 
              placeholderTextColor="#999"
              style={styles.searchInput}
              editable={false}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Feather name="sliders" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionLabel}>Quick Filter</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((cat, i) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryTab, i === 0 && styles.activeCategoryTab]}
              >
                <Text style={[styles.categoryText, i === 0 && styles.activeCategoryText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {products.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item, index }) => (
              <ProductCard
                product={item}
                index={index}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              />
            )}
          />
        )}
      </SafeAreaView>

      {/* Mock Bottom Tabs */}
      <View style={styles.bottomNavContainer}>
        <BlurView intensity={80} tint="light" style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="home" size={24} color="#000" />
            <View style={styles.activeDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="grid" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addNavBtn} onPress={handleAdd}>
            <View style={styles.addNavCircle}>
              <Feather name="plus" size={28} color="#FFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Feather name="heart" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="user" size={24} color="#999" />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

// Added missing imports for the code above
import { Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  safe: { flex: 1 },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: '800', color: '#000', lineHeight: 36, textAlign: 'center' },
  profileBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#EEE' },
  profileImg: { width: '100%', height: '100%' },
  searchContainer: { paddingHorizontal: 24, marginBottom: 24 },
  list: { paddingHorizontal: 24, paddingBottom: 120 },
  columnWrapper: { justifyContent: 'space-between' },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F5F5', 
    borderRadius: 20, 
    paddingLeft: 16,
    paddingRight: 8,
    height: 56,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#000', fontSize: 15 },
  filterBtn: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  categorySection: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 24, marginBottom: 12 },
  categoryList: { paddingLeft: 24, paddingRight: 12 },
  categoryTab: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 18, 
    backgroundColor: '#F5F5F5', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  activeCategoryTab: { backgroundColor: '#000' },
  categoryText: { color: '#666', fontWeight: '600', fontSize: 14 },
  activeCategoryText: { color: '#FFF', fontWeight: '700' },
  bottomNavContainer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20, 
    height: 72, 
    borderRadius: 36, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  bottomNav: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 44, height: 44 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#000', marginTop: 4 },
  addNavBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  addNavCircle: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});


