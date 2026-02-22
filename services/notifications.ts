import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'HATIM_NOTIFICATION_SETTINGS';

export interface NotificationSettings {
    prayerNotifications: boolean;
    chainNotifications: boolean;
    prayerMinutesBefore: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    prayerNotifications: false,
    chainNotifications: false,
    prayerMinutesBefore: 10,
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    async registerForPushNotifications(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return false;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Hatim Zinciri',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                });
            }

            return true;
        } catch {
            return false;
        }
    },

    async scheduleNotification(title: string, body: string, triggerDate: Date): Promise<string | null> {
        try {
            const trigger = triggerDate.getTime() - Date.now();
            if (trigger <= 0) return null;

            const id = await Notifications.scheduleNotificationAsync({
                content: { title, body, sound: true },
                trigger: { seconds: Math.floor(trigger / 1000), type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
            });
            return id;
        } catch {
            return null;
        }
    },

    async schedulePrayerNotification(prayerName: string, prayerTime: string, minutesBefore: number): Promise<void> {
        try {
            const [hours, minutes] = prayerTime.split(':').map(Number);
            const now = new Date();
            const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            prayerDate.setMinutes(prayerDate.getMinutes() - minutesBefore);

            if (prayerDate.getTime() > now.getTime()) {
                await this.scheduleNotification(
                    `${prayerName} Vakti Yaklaşıyor`,
                    `${prayerName} vaktine ${minutesBefore} dakika kaldı.`,
                    prayerDate
                );
            }
        } catch {
            // silently fail
        }
    },

    async scheduleChainEndNotification(chainTitle: string, endDate: string): Promise<void> {
        try {
            const end = new Date(endDate);
            const now = new Date();

            const oneDayBefore = new Date(end.getTime() - 24 * 60 * 60 * 1000);
            if (oneDayBefore.getTime() > now.getTime()) {
                await this.scheduleNotification(
                    'Zincir Bitiyor!',
                    `"${chainTitle}" zincirine 1 gün kaldı.`,
                    oneDayBefore
                );
            }

            const threeHoursBefore = new Date(end.getTime() - 3 * 60 * 60 * 1000);
            if (threeHoursBefore.getTime() > now.getTime()) {
                await this.scheduleNotification(
                    'Zincir Bitiyor!',
                    `"${chainTitle}" zincirine 3 saat kaldı!`,
                    threeHoursBefore
                );
            }
        } catch {
            // silently fail
        }
    },

    async getSettings(): Promise<NotificationSettings> {
        try {
            const json = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
            return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    },

    async saveSettings(settings: NotificationSettings): Promise<void> {
        await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    },

    async cancelAll(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
