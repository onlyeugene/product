import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function LimitBanner() {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={styles.icon}>🔔</Text>
      <View style={styles.textWrap}>
        <Text style={styles.heading}>Product limit reached</Text>
        <Text style={styles.sub}>You've uploaded the maximum of 5 products.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1000',
    borderWidth: 1,
    borderColor: '#FF5C28',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    gap: 12,
  },
  icon: { fontSize: 22 },
  textWrap: { flex: 1 },
  heading: { color: '#FF5C28', fontWeight: '700', fontSize: 14 },
  sub: { color: '#A0785A', fontSize: 13, marginTop: 2 },
});
