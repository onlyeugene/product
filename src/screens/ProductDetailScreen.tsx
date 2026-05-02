import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useProducts } from '../context/ProductContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_UPPER_LIMIT = -SCREEN_HEIGHT + 100;
const INITIAL_DETENT = -500; // Raised from -400 to overlap more
const OVERLAP_DETENT = -SCREEN_HEIGHT * 0.6; // Midway point

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { state, removeProduct } = useProducts();

  const product = state.products.find((p) => p.id === route.params.productId);

  // Bottom Sheet Animation
  const translateY = useSharedValue(INITIAL_DETENT);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_UPPER_LIMIT);
    })
    .onEnd((event) => {
      const { velocityY } = event;
      
      // If dragging down fast
      if (velocityY > 500) {
        if (translateY.value < OVERLAP_DETENT) {
          translateY.value = withSpring(OVERLAP_DETENT);
        } else {
          translateY.value = withSpring(INITIAL_DETENT);
        }
        return;
      }

      // If dragging up fast
      if (velocityY < -500) {
        if (translateY.value > OVERLAP_DETENT) {
          translateY.value = withSpring(OVERLAP_DETENT);
        } else {
          translateY.value = withSpring(MAX_UPPER_LIMIT);
        }
        return;
      }

      // Snap to closest point based on position
      if (translateY.value > (INITIAL_DETENT + OVERLAP_DETENT) / 2) {
        translateY.value = withSpring(INITIAL_DETENT);
      } else if (translateY.value > (OVERLAP_DETENT + MAX_UPPER_LIMIT) / 2) {
        translateY.value = withSpring(OVERLAP_DETENT);
      } else {
        translateY.value = withSpring(MAX_UPPER_LIMIT);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + SCREEN_HEIGHT }],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [INITIAL_DETENT, 0],
      [1, 1.5],
      Extrapolation.CLAMP
    );
    const ty = interpolate(
      translateY.value,
      [INITIAL_DETENT, 0],
      [0, 50],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { scale: scale },
        { translateY: ty }
      ] as any,
    };
  });

  if (!product) {
    navigation.goBack();
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      'Remove Product',
      `Are you sure you want to remove "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeProduct(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const categories = ['Details', 'Inventory', 'History', 'Insights'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Hero Image Section */}
        <Animated.View style={[styles.heroContainer, imageStyle]}>
          {product.photoUri ? (
            <Image source={{ uri: product.photoUri }} style={styles.heroImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Feather name="package" size={80} color="#CCC" />
            </View>
          )}
        </Animated.View>

        {/* Floating Header */}
        <SafeAreaView style={styles.headerSafeArea} pointerEvents="box-none">
          <View style={styles.headerContent} pointerEvents="box-none">
            <TouchableOpacity 
              style={styles.headerBtn} 
              onPress={() => navigation.goBack()}
            >
              <BlurView intensity={60} tint="light" style={styles.blurBtn}>
                <Feather name="chevron-left" size={24} color="#000" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerBtn}>
              <BlurView intensity={60} tint="light" style={styles.blurBtn}>
                <Feather name="heart" size={22} color="#000" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Draggable Bottom Sheet */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.card, animatedStyle]}>
            <View style={styles.dragIndicator} />
            
            <Animated.ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.titleSection}>
                <View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>Created on {formattedDate}</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>₦ {parseFloat(product.price).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.tabContainer}>
                <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat, i) => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[styles.tab, i === 0 && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, i === 0 && styles.activeTabText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </Animated.ScrollView>
              </View>

              <Text style={styles.sectionTitle}>Management</Text>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate('AddProduct', { productId: product.id })}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name="edit-3" size={20} color="#000" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionLabel}>Edit Details</Text>
                  <Text style={styles.actionSubLabel}>Update name and pricing</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIconContainer}>
                  <Feather name="camera" size={20} color="#000" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionLabel}>Update Image</Text>
                  <Text style={styles.actionSubLabel}>Change product photo</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionItem, styles.lastAction]}
                onPress={handleDelete}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FF3B3015' }]}>
                  <Feather name="trash-2" size={20} color="#FF3B30" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionLabel, { color: '#FF3B30' }]}>Delete Product</Text>
                  <Text style={styles.actionSubLabel}>Remove from inventory</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#FF3B30" />
              </TouchableOpacity>

              <View style={styles.spacer} />
            </Animated.ScrollView>
          </Animated.View>
        </GestureDetector>

        {/* Bottom Floating Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Return to Inventory</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  heroContainer: { 
    height: 550, // Increased from 400 to ensure overlap
    width: '100%', 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0,
    backgroundColor: '#000' 
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContainer: { 
    height: 550,
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingTop: 10
  },
  headerBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  blurBtn: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  card: { 
    position: 'absolute',
    top: 0,
    width: '100%',
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#EEE',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24
  },
  titleSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 24
  },
  productName: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 4 },
  productMeta: { fontSize: 14, color: '#999', fontWeight: '500' },
  priceTag: { 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  priceText: { fontSize: 18, fontWeight: '700', color: '#000' },
  tabContainer: { marginBottom: 32, marginHorizontal: -24, paddingLeft: 24 },
  tab: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  activeTab: { backgroundColor: '#000' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  actionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  lastAction: { marginBottom: 0 },
  actionIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  actionTextContainer: { flex: 1 },
  actionLabel: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
  actionSubLabel: { fontSize: 12, color: '#999' },
  spacer: { height: 180 },
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 24, 
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    zIndex: 20
  },
  primaryBtn: { 
    backgroundColor: '#000', 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
