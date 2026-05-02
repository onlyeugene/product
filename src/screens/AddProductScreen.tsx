import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useProducts, MAX_PRODUCTS } from '../context/ProductContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { triggerLimitNotification } from '../utils/notifications';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
type Route = RouteProp<RootStackParamList, 'AddProduct'>;

export default function AddProductScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { addProduct, updateProduct, state, markNotified } = useProducts();

  const editId = route.params?.productId;
  const existingProduct = editId
    ? state.products.find((p) => p.id === editId)
    : null;

  const [name, setName] = useState(existingProduct?.name ?? '');
  const [price, setPrice] = useState(existingProduct?.price ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(existingProduct?.photoUri ?? null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to add a product image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Enter a valid price';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      shake();
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const wasAtLimit = state.products.length === MAX_PRODUCTS - 1;

    if (existingProduct) {
      updateProduct({ ...existingProduct, name: name.trim(), price, photoUri });
    } else {
      const added = addProduct({ name: name.trim(), price, photoUri });
      if (!added) {
        Alert.alert('Limit reached', 'You can only upload up to 5 products.');
        return;
      }
      if (wasAtLimit) {
        await triggerLimitNotification();
        markNotified();
      }
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Feather name="chevron-left" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.title}>{existingProduct ? 'Edit Details' : 'New Product'}</Text>
              <View style={{ width: 44 }} />
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              {/* Photo picker */}
              <TouchableOpacity style={styles.photoArea} onPress={pickImage} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <View style={styles.photoIconCircle}>
                      <Feather name="camera" size={32} color="#666" />
                    </View>
                    <Text style={styles.photoHint}>Add Product Photo</Text>
                  </View>
                )}
                {photoUri && (
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoOverlayText}>Tap to Change</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={styles.formCard}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Product Name</Text>
                  <TextInput
                    style={[styles.input, errors.name ? styles.inputError : null]}
                    placeholder="e.g. Premium Tech Bundle"
                    placeholderTextColor="#444"
                    value={name}
                    onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                    returnKeyType="next"
                    maxLength={60}
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Price (NGN)</Text>
                  <View style={[styles.priceInputRow, errors.price ? styles.inputError : null]}>
                    <Text style={styles.currency}>₦</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0.00"
                      placeholderTextColor="#444"
                      value={price}
                      onChangeText={(v) => { setPrice(v); setErrors((e) => ({ ...e, price: undefined })); }}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                  {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                </View>
              </View>
            </Animated.View>

            <View style={styles.spacer} />
            
            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>{existingProduct ? 'Save Changes' : 'Confirm & Add'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 22 },
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  photoArea: {
    height: 320,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 24,
  },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  photoHint: { color: '#999', fontSize: 15, fontWeight: '600' },
  photoOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  photoOverlayText: { color: '#000', fontSize: 13, fontWeight: '600' },
  formCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  fieldGroup: { marginBottom: 24 },
  label: { color: '#999', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#000',
    fontSize: 16,
  },
  inputError: { borderColor: '#FF3B30' },
  priceInputRow: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: { color: '#999', fontSize: 18, fontWeight: '700', marginRight: 8 },
  priceInput: { flex: 1, color: '#000', fontSize: 16, paddingVertical: 16 },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 6, marginLeft: 4 },
  saveBtn: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  spacer: { height: 24 },
});


