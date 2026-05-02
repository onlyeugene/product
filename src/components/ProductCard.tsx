import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Product } from "../context/ProductContext";

const { width } = Dimensions.get("window");
const GRID_SPACING = 24; // Increased spacing from 16
const CARD_WIDTH = (width - GRID_SPACING * 3) / 2;

interface Props {
  product: Product;
  index: number;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {product.photoUri ? (
          <Image source={{ uri: product.photoUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Feather name="package" size={40} color="#EEE" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
      

        <View style={styles.footer}>
          <Text style={styles.price}>
            ₦{parseFloat(product.price).toLocaleString()}
          </Text>
          <TouchableOpacity style={styles.addBtn} onPress={onPress}>
            <Feather name="plus" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    borderRadius: 24, // Smaller radius for a tighter look
    padding: 12, // Reduced padding
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: "#F0F0F0",
    // Very subtle elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  imageContainer: {
    width: "100%",
    height: 100, // Reduced height from 120
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
  },
  infoContainer: {
    width: "100%",
  },
  name: {
    fontSize: 14, // Slightly smaller text
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
    textTransform: "capitalize"
  },
  weightText: {
    fontSize: 11,
    color: "#AAA",
    fontWeight: "500",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#2A5EEF",
    justifyContent: "center",
    alignItems: "center",
  },
});
