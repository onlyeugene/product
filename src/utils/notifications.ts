import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5C28',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function triggerLimitNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    // Falls back gracefully — the in-app LimitBanner still shows
    console.warn('Notification permission not granted');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Product limit reached',
      body: "You've added all 5 products. Remove one to add another.",
      data: { type: 'product_limit' },
      color: '#FF5C28',
    },
    trigger: null, // immediate
  });
}
