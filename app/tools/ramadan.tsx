import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Setup notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Imsak?: string; // Some APIs provide this
}

const STORAGE_KEY_FASTING = 'HATIM_RAMADAN_FASTING';

export default function RamadanScreen() {
    const [loading, setLoading] = useState(true);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [nextPrayer, setNextPrayer] = useState<{ name: string, time: string, timeLeft: string } | null>(null);
    const [locationName, setLocationName] = useState('');
    const [fastingDays, setFastingDays] = useState<string[]>([]); // 'YYYY-MM-DD'
    const [activeTab, setActiveTab] = useState<'imsakiye' | 'menuler' | 'takip'>('imsakiye');
    const [waterReminder, setWaterReminder] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (prayerTimes) {
            const timer = setInterval(updateCountdown, 1000);
            return () => clearInterval(timer);
        }
    }, [prayerTimes]);

    const loadData = async () => {
        try {
            await Promise.all([
                getLocationAndPrayers(),
                loadFastingData(),
            ]);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const loadFastingData = async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_FASTING);
        if (stored) setFastingDays(JSON.parse(stored));
    };

    const toggleFastingDay = async (dateStr: string) => {
        let newDays;
        if (fastingDays.includes(dateStr)) {
            newDays = fastingDays.filter(d => d !== dateStr);
        } else {
            newDays = [...fastingDays, dateStr];
        }
        setFastingDays(newDays);
        await AsyncStorage.setItem(STORAGE_KEY_FASTING, JSON.stringify(newDays));
    };

    const getLocationAndPrayers = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Hata', 'Konum izni verilmedi.');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Get City Name
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) {
            setLocationName(address.city || address.region || 'Konumunuz');
        }

        // Fetch Prayer Times (Aladhan API) - Method 13 (Diyanet)
        const date = new Date();
        const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=13`);
        const data = await response.json();

        if (data.data && data.data.timings) {
            setPrayerTimes(data.data.timings);
            updateCountdown(data.data.timings);
        }
    };

    const updateCountdown = (times = prayerTimes) => {
        if (!times) return;

        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);

        // Ordered prayers for check
        // Check next prayer
        // Simple logic: convert all to minutes and compare
        // Implementation omitted for brevity, focusing on Iftar/Sahur logic which is requested

        // Iftar = Maghrib
        // Sahur = Fajr (or Imsak if available)

        const maghrib = getObjDate(times.Maghrib);
        const fajr = getObjDate(times.Fajr); // Tomorrow Fajr for next Sahur if Maghrib passed, today Fajr if before

        // ... Logic to calculate countdown to next Iftar or Sahur
        // For simplified view:
        let targetTime = maghrib;
        let targetName = 'İFTAR';

        if (now > maghrib) {
            // After Iftar, next target is Sahur (Tomorrow Fajr)
            targetName = 'SAHUR';
            const tomorrowFajr = new Date(fajr);
            tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
            targetTime = tomorrowFajr;
        } else if (now < getObjDate(times.Fajr)) {
            // Before today Fajr
            targetName = 'SAHUR';
            targetTime = getObjDate(times.Fajr);
        }

        const diffMs = targetTime.getTime() - now.getTime();
        const h = Math.floor(diffMs / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffMs % (1000 * 60)) / 1000);

        setNextPrayer({
            name: targetName,
            time: targetName === 'İFTAR' ? times.Maghrib : times.Fajr,
            timeLeft: `${h} sa ${m} dk ${s} sn`
        });
    };

    const getObjDate = (timeStr: string) => {
        const d = new Date();
        const [h, m] = timeStr.split(':');
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        return d;
    };

    const toggleWaterReminder = async (val: boolean) => {
        setWaterReminder(val);
        if (val) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Su İçme Hatırlatıcısı",
                        body: "İftar ile Sahur arasında su içmeyi unutmayın!",
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 3600, // Every hour (simplified)
                        repeats: true,
                    },
                });
                Alert.alert('Başarılı', 'Su hatırlatıcısı açıldı. Saatte bir bildirim alacaksınız.');
            }
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Stack.Screen options={{ title: 'Ramazan Özel', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />
                <ActivityIndicator size="large" color="#70c5bb" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <Stack.Screen options={{ title: 'Ramazan Özel', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />

            {/* Countdown Header */}
            <View style={{ alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(112,197,187,0.1)' }}>
                <Text style={{ color: '#a8c5bf', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{locationName}</Text>
                <Text style={{ color: '#fff', fontSize: 16, marginTop: 4 }}>{nextPrayer?.name}'A KALAN SÜRE</Text>
                <Text style={{ color: '#D4AF37', fontSize: 36, fontWeight: '800', marginTop: 8 }}>
                    {nextPrayer?.timeLeft}
                </Text>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
                {['imsakiye', 'menuler', 'takip'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab as any)}
                        style={{
                            flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                            backgroundColor: activeTab === tab ? '#70c5bb' : 'rgba(112,197,187,0.1)'
                        }}
                    >
                        <Text style={{ color: activeTab === tab ? '#01241e' : '#fff', fontWeight: '700', textTransform: 'capitalize' }}>
                            {tab === 'menuler' ? 'Menüler' : tab === 'takip' ? 'Oruç Takip' : 'İmsakiye'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {activeTab === 'imsakiye' && prayerTimes && (
                    <View style={{ backgroundColor: '#032b23', borderRadius: 16, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>İmsak</Text>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Imsak || prayerTimes.Fajr}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 16 }}>Güneş</Text>
                            <Text style={{ color: '#a8c5bf', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Sunrise}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Öğle</Text>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Dhuhr}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>İkindi</Text>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Asr}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 8 }}>
                            <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700' }}>Akşam (İftar)</Text>
                            <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Maghrib}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Yatsı</Text>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{prayerTimes.Isha}</Text>
                        </View>
                    </View>
                )}

                {activeTab === 'menuler' && (
                    <View>
                        <View style={{ backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                            <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Günün İftar Menüsü</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Mercimek Çorbası</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• İslim Kebabı</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Pirinç Pilavı</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Mevsim Salatası</Text>
                            <Text style={{ color: '#fff', fontSize: 15 }}>• Güllaç</Text>
                        </View>

                        <View style={{ backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                            <Text style={{ color: '#70c5bb', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Sahur Önerisi</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Haşlanmış Yumurta (Tok tutar)</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Ceviz ve Peynir Tabağı</Text>
                            <Text style={{ color: '#fff', fontSize: 15, marginBottom: 6 }}>• Az Tuzlu Zeytin</Text>
                            <Text style={{ color: '#fff', fontSize: 15 }}>• Bol Su</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#032b23', padding: 16, borderRadius: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Su İçme Hatırlatıcısı</Text>
                                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>İftar-Sahur arası saat başı uyar</Text>
                            </View>
                            <Switch
                                value={waterReminder}
                                onValueChange={toggleWaterReminder}
                                trackColor={{ false: '#4a7a72', true: '#70c5bb' }}
                                thumbColor={waterReminder ? '#D4AF37' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                )}

                {activeTab === 'takip' && (
                    <View>
                        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>Ramazan Günleri (Tuttuklarınızı İşaretleyin)</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {Array.from({ length: 30 }, (_, i) => {
                                // Mock Ramazan starting roughly March 2026? 
                                // For demo, we just show numbers 1-30
                                const dayNum = i + 1;
                                const dateKey = `day-${dayNum}`;
                                const isFasted = fastingDays.includes(dateKey);

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => toggleFastingDay(dateKey)}
                                        style={{
                                            width: '18%', aspectRatio: 1, backgroundColor: isFasted ? '#10b981' : '#032b23',
                                            borderRadius: 12, justifyContent: 'center', alignItems: 'center',
                                            borderWidth: 1, borderColor: isFasted ? '#10b981' : 'rgba(112,197,187,0.1)'
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{dayNum}</Text>
                                        {isFasted && <Ionicons name="checkmark" size={16} color="#fff" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={{ marginTop: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#70c5bb', fontSize: 48, fontWeight: '800' }}>
                                {fastingDays.length}
                            </Text>
                            <Text style={{ color: '#a8c5bf', fontSize: 14 }}>Gün Oruç Tuttunuz</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
