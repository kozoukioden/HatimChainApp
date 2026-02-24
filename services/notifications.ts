import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = 'HATIM_NOTIFICATION_SETTINGS';

export interface NotificationSettings {
    prayerNotifications: boolean;
    chainNotifications: boolean;
    prayerMinutesBefore: number;
    dailyPrayerSummary: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    prayerNotifications: false,
    chainNotifications: false,
    prayerMinutesBefore: 10,
    dailyPrayerSummary: false,
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

    async scheduleNotification(title: string, body: string, triggerDate: Date, identifier?: string): Promise<string | null> {
        try {
            const trigger = triggerDate.getTime() - Date.now();
            if (trigger <= 0) return null;

            return await Notifications.scheduleNotificationAsync({
                identifier,
                content: { title, body, sound: true },
                trigger: { seconds: Math.max(1, Math.floor((triggerDate.getTime() - Date.now()) / 1000)), type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
            });
        } catch {
            return null;
        }
    },

    async scheduleAllPrayers(prayerTimes: any): Promise<void> {
        try {
            const settings = await this.getSettings();

            // Cancel previously scheduled prayer notifications
            await Notifications.cancelAllScheduledNotificationsAsync();

            if (settings.dailyPrayerSummary) {
                const body = `İmsak: ${prayerTimes.Fajr}  Öğle: ${prayerTimes.Dhuhr}  İkindi: ${prayerTimes.Asr}  Akşam: ${prayerTimes.Maghrib}  Yatsı: ${prayerTimes.Isha}`;
                await Notifications.scheduleNotificationAsync({
                    identifier: 'daily_prayer_summary',
                    content: {
                        title: '📅 Günlük Namaz Vakitleri',
                        body,
                        autoDismiss: false,
                        sticky: true,
                        sound: false,
                    },
                    trigger: null, // deliver immediately
                });
            } else {
                await Notifications.dismissNotificationAsync('daily_prayer_summary');
            }

            if (settings.prayerNotifications) {
                const minutesBefore = settings.prayerMinutesBefore || 10;
                const PRAYER_NAMES: Record<string, string> = {
                    Fajr: 'İmsak', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı'
                };

                for (const [key, name] of Object.entries(PRAYER_NAMES)) {
                    const timeStr = prayerTimes[key];
                    if (!timeStr) continue;

                    const [hours, minutes] = timeStr.split(':').map(Number);
                    const now = new Date();
                    const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
                    prayerDate.setMinutes(prayerDate.getMinutes() - minutesBefore);

                    if (prayerDate.getTime() > now.getTime()) {
                        await this.scheduleNotification(
                            `${name} Vakti Yaklaşıyor`,
                            `${name} vaktine ${minutesBefore} dakika kaldı.`,
                            prayerDate,
                            `prayer_${key}`
                        );
                    }
                }
            }
        } catch (e) {
            console.log('Prayer notification error:', e);
        }
    },

    async scheduleChainNotifications(chains: any[]): Promise<void> {
        try {
            const settings = await this.getSettings();
            if (!settings.chainNotifications) return;

            const now = new Date();
            for (const chain of chains) {
                if (chain.isCompleted || !chain.endDate) continue;
                const end = new Date(chain.endDate);

                // Check 1 day before
                const oneDayBefore = new Date(end.getTime() - 24 * 60 * 60 * 1000);
                if (oneDayBefore.getTime() > now.getTime()) {
                    await this.scheduleNotification(
                        'Zincir Bitiyor!',
                        `"${chain.title}" zincirine 1 gün kaldı.`,
                        oneDayBefore,
                        `chain_1d_${chain.id}`
                    );
                }

                // Check 3 hours before
                const threeHoursBefore = new Date(end.getTime() - 3 * 60 * 60 * 1000);
                if (threeHoursBefore.getTime() > now.getTime()) {
                    await this.scheduleNotification(
                        'Zincir Bitiyor!',
                        `"${chain.title}" zincirine 3 saat kaldı!`,
                        threeHoursBefore,
                        `chain_3h_${chain.id}`
                    );
                }
            }
        } catch (e) {
            console.log('Chain notification error:', e);
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
