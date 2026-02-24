import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Platform,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { PrayerService, PrayerTimes } from '../../../services/api';
import { AuthService, User } from '../../../services/auth';
import { ChainService, Chain } from '../../../services/chains';
import { KandilService, KandilDate } from '../../../services/kandil';
import { NotificationService } from '../../../services/notifications';
import * as Location from 'expo-location';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// --- Constants ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRAYER_NAMES: Record<string, string> = {
    Fajr: 'İmsak',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı',
};
const PRAYER_ICONS: Record<string, string> = {
    Fajr: 'moon-outline',
    Dhuhr: 'sunny',
    Asr: 'partly-sunny-outline',
    Maghrib: 'cloudy-night-outline',
    Isha: 'moon',
};
const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const COLORS = {
    primary: '#01241e',
    card: '#032b23',
    accent: '#70c5bb',
    gold: '#D4AF37',
    muted: '#4a7a72',
    text: '#a8c5bf',
};

const DAILY_VERSES = [
    { surah: 'Bakara', ayah: 286, text: 'Allah her şahsa ancak gücünün yettiği kadar yükler.' },
    { surah: 'İnşirah', ayah: 6, text: 'Şüphesiz her güçlüğün yanında bir kolaylık vardır.' },
    { surah: 'Bakara', ayah: 152, text: 'Beni anın ki, ben de sizi anayım.' },
    { surah: 'Rad', ayah: 28, text: 'Biliniz ki kalpler ancak Allah\'ı anmakla huzura kavuşur.' },
    { surah: 'Talak', ayah: 3, text: 'Kim Allah\'a tevekkül ederse, O ona yeter.' },
    { surah: 'Zümer', ayah: 53, text: 'Allah\'ın rahmetinden ümit kesmeyin. Allah bütün günahları bağışlar.' },
    { surah: 'Mümin', ayah: 60, text: 'Bana dua edin, size karşılık vereyim.' },
    { surah: 'Ankebut', ayah: 69, text: 'Bizim uğrumuzda mücadele edenlere biz yollarımızı gösteririz.' },
    { surah: 'Haşr', ayah: 18, text: 'Ey iman edenler! Allah\'tan korkun ve herkes yarın için ne hazırladığına baksın.' },
    { surah: 'Âl-i İmrân', ayah: 139, text: 'Gevşemeyin, üzülmeyin; eğer iman ediyorsanız en üstün olan sizlersiniz.' },
];

function getDailyVerse() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

function getNextPrayer(prayerTimes: PrayerTimes): { name: string; time: string } | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const key of PRAYER_ORDER) {
        const timeStr = prayerTimes[key];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > currentMinutes) {
            return { name: key, time: timeStr };
        }
    }
    return { name: PRAYER_ORDER[0], time: prayerTimes[PRAYER_ORDER[0]] };
}

function formatTimeRemaining(timeStr: string): string {
    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    let diffMinutes = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0) return `${hours} sa ${mins} dk`;
    return `${mins} dk`;
}

export default function HomeScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loadingPrayer, setLoadingPrayer] = useState(true);
    const [locationText, setLocationText] = useState('Konum alınıyor...');
    const [myChains, setMyChains] = useState<Chain[]>([]);
    const [recentChains, setRecentChains] = useState<Chain[]>([]);
    const [kandils, setKandils] = useState<KandilDate[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [ramadanCountdown, setRamadanCountdown] = useState<{ target: string; time: string; hours: number; minutes: number; remainingDays: number; currentDay?: number } | null>(null);

    const IFTAR_MENUS = [
        ['Mercimek Çorbası', 'İslim Kebabı', 'Pirinç Pilavı', 'Mevsim Salatası', 'Güllaç'],
        ['Ezogelin Çorbası', 'Fırın Tavuk', 'Bulgur Pilavı', 'Cacık', 'Sütlaç'],
        ['Tarhana Çorbası', 'Karnıyarık', 'Pirinç Pilavı', 'Yoğurt', 'Şekerpare'],
        ['Domates Çorbası', 'Etli Orman Kebabı', 'Arpa Şehriye Pilavı', 'Çoban Salata', 'Revani'],
        ['Yayla Çorbası', 'Kıymalı Pide', 'Ayran', 'Çoban Salata', 'Kemalpaşa Tatlısı'],
        ['Sebze Çorbası', 'Mantar Sote', 'Makarna', 'Mevsim Salatası', 'Künefe'],
        ['Tavuk Suyu Çorbası', 'Köfte Patates', 'Pirinç Pilavı', 'Ayran', 'Meyve Tabağı']
    ];
    const todayMenuIndex = new Date().getDate() % IFTAR_MENUS.length;
    const todayMenu = IFTAR_MENUS[todayMenuIndex];

    const dailyVerse = getDailyVerse();

    // Request base permissions on load if not asked
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }
        })();
    }, []);

    // Ramazan countdown timer
    useEffect(() => {
        const updateRamadanCountdown = () => {
            if (!prayerTimes) return;
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();

            // Maghrib = İftar, Fajr = Sahur
            const maghribStr = prayerTimes['Maghrib'] || prayerTimes['Sunset'];
            const fajrStr = prayerTimes['Fajr'];
            if (!maghribStr || !fajrStr) return;

            const [mH, mM] = maghribStr.split(':').map(Number);
            const [fH, fM] = fajrStr.split(':').map(Number);
            const maghribMinutes = mH * 60 + mM;
            const fajrMinutes = fH * 60 + fM;

            let targetName: string;
            let diffMinutes: number;

            if (nowMinutes < fajrMinutes) {
                // Before Fajr -> countdown to Sahur
                targetName = 'SAHUR';
                diffMinutes = fajrMinutes - nowMinutes;
            } else if (nowMinutes < maghribMinutes) {
                // After Fajr, before Maghrib -> countdown to İftar
                targetName = 'İFTAR';
                diffMinutes = maghribMinutes - nowMinutes;
            } else {
                // After Maghrib -> countdown to next Sahur (tomorrow Fajr)
                targetName = 'SAHUR';
                diffMinutes = (24 * 60 - nowMinutes) + fajrMinutes;
            }

            const h = Math.floor(diffMinutes / 60);
            const m = diffMinutes % 60;

            // Ramazan 2026: ~Feb 18 - Mar 19 (approx)
            const ramadanStart = new Date(2026, 1, 18); // Feb 18
            const ramadanEnd = new Date(2026, 2, 19); // March 19, 2026
            const daysLeft = Math.max(0, Math.ceil((ramadanEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            let currentDay = 0;
            if (now >= ramadanStart && now <= ramadanEnd) {
                currentDay = Math.floor((now.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }

            setRamadanCountdown({
                target: targetName,
                time: targetName === 'İFTAR' ? maghribStr : fajrStr,
                hours: h,
                minutes: m,
                remainingDays: Math.min(daysLeft, 30),
                currentDay: currentDay
            });
        };

        updateRamadanCountdown();
        const timer = setInterval(updateRamadanCountdown, 30000); // Update every 30 seconds
        return () => clearInterval(timer);
    }, [prayerTimes]);

    const fetchLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationText('İstanbul, Türkiye');
                return null;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            // Reverse geocode for R13 - "İlçe, İl, Ülke"
            try {
                const geocode = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (geocode && geocode.length > 0) {
                    const g = geocode[0];
                    const district = g.subregion || g.district || '';
                    const city = g.city || g.region || '';
                    const country = g.country || '';
                    const parts = [district, city, country].filter(Boolean);
                    setLocationText(parts.join(', ') || 'Konum bulundu');
                } else {
                    setLocationText('Konum bulundu');
                }
            } catch {
                setLocationText('Konum bulundu');
            }
            return { lat: loc.coords.latitude, lng: loc.coords.longitude };
        } catch {
            setLocationText('İstanbul, Türkiye');
            return null;
        }
    }, []);

    const fetchPrayerTimes = useCallback(async () => {
        setLoadingPrayer(true);
        try {
            const coords = await fetchLocation();
            let times: PrayerTimes | null = null;
            if (coords) {
                times = await PrayerService.getPrayerTimesByLocation(coords.lat, coords.lng);
            }
            // Istanbul fallback
            if (!times) {
                setLocationText('İstanbul, Türkiye');
                times = await PrayerService.getPrayerTimes('Istanbul', 'Turkey');
            }
            setPrayerTimes(times);
            if (times) {
                NotificationService.scheduleAllPrayers(times);
            }
        } catch {
            const times = await PrayerService.getPrayerTimes('Istanbul', 'Turkey');
            setPrayerTimes(times);
            if (times) {
                NotificationService.scheduleAllPrayers(times);
            }
            setLocationText('İstanbul, Türkiye');
        } finally {
            setLoadingPrayer(false);
        }
    }, [fetchLocation]);

    const loadData = useCallback(async () => {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);

        await fetchPrayerTimes();

        // Kandil dates
        setKandils(KandilService.getUpcomingKandils(5));

        // Chains
        if (currentUser) {
            const mine = await ChainService.getChainsByUser(currentUser.id);
            setMyChains(mine.slice(0, 10));
            NotificationService.scheduleChainNotifications(mine);
        }
        const allChains = await ChainService.getAllChains();
        setRecentChains(allChains.slice(0, 5));
    }, [fetchPrayerTimes]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    // R13 - Prayer time detail modal
    const handlePrayerPress = (prayerKey: string) => {
        if (!prayerTimes) return;
        const name = PRAYER_NAMES[prayerKey] || prayerKey;
        const time = prayerTimes[prayerKey];
        Alert.alert(
            `${name} Namazı`,
            `Vakit: ${time}\n\nBu namaz vaktinden önce hatırlatılmak ister misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: '5 dk önce hatırlat',
                    onPress: () => Alert.alert('Hatırlatıcı', `${name} namazı için 5 dakika önce hatırlatıcı kuruldu.`),
                },
                {
                    text: '15 dk önce hatırlat',
                    onPress: () => Alert.alert('Hatırlatıcı', `${name} namazı için 15 dakika önce hatırlatıcı kuruldu.`),
                },
                {
                    text: '30 dk önce hatırlat',
                    onPress: () => Alert.alert('Hatırlatıcı', `${name} namazı için 30 dakika önce hatırlatıcı kuruldu.`),
                },
            ]
        );
    };

    // R7 - Kandil popup
    const handleKandilPress = (kandil: KandilDate) => {
        const dateObj = new Date(kandil.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const daysLeft = KandilService.getDaysUntil(kandil.date);
        Alert.alert(
            kandil.name,
            `${kandil.description}\n\nTarih: ${formattedDate}\n\n${daysLeft > 0 ? `${daysLeft} gün kaldı` : daysLeft === 0 ? 'Bugün!' : 'Geçti'}`
        );
    };

    const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null;

    // --- RENDER ---
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                        colors={[COLORS.accent]}
                    />
                }
            >
                {/* ========== Greeting ========== */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greetingText}>
                        Selamün Aleyküm{user ? `, ${user.fullName.split(' ')[0]}` : ''}
                    </Text>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>

                {/* Donate Button (R5) */}
                <TouchableOpacity
                    style={{
                        backgroundColor: 'rgba(212,175,55,0.15)',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(212,175,55,0.3)',
                    }}
                    onPress={() => Alert.alert('Bağış', 'Bu özellik yakında aktif olacaktır. Şu an test aşamasındadır.')}
                >
                    <Ionicons name="heart" size={20} color="#D4AF37" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#D4AF37', fontWeight: '700', fontSize: 14 }}>Uygulamaya Destek Ol / Bağış Yap</Text>
                </TouchableOpacity>

                {/* ========== Ramazan Countdown Section (R3/R4/R5) ========== */}
                {ramadanCountdown && prayerTimes && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: COLORS.card,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: 'rgba(212,175,55,0.2)',
                        }}
                        onPress={() => router.push('/tools/ramadan')}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                            <Ionicons name="moon" size={20} color={COLORS.gold} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 }}>Ramazan</Text>
                            <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ color: COLORS.gold, fontSize: 11, fontWeight: '700' }}>
                                    {ramadanCountdown.currentDay && ramadanCountdown.currentDay > 0
                                        ? `Ramazan'ın ${ramadanCountdown.currentDay}. Günü`
                                        : `${ramadanCountdown.remainingDays} gün kaldı`}
                                </Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <Text style={{ color: COLORS.text, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {ramadanCountdown.target}'A KALAN SÜRE
                            </Text>
                            <Text style={{ color: COLORS.gold, fontSize: 32, fontWeight: '800', marginTop: 4 }}>
                                {ramadanCountdown.hours} sa {ramadanCountdown.minutes} dk
                            </Text>
                            <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
                                {ramadanCountdown.target === 'İFTAR' ? 'Akşam' : 'İmsak'}: {ramadanCountdown.time}
                            </Text>
                        </View>
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Günün İftar Menüsü</Text>
                            <Text style={{ color: '#fff', fontSize: 13, lineHeight: 20 }}>
                                {todayMenu.join(' • ')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 4 }}>
                            <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '600' }}>İmsakiye & Oruç Takibi</Text>
                            <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
                        </View>
                    </TouchableOpacity>
                )}

                {/* ========== Prayer Times Section ========== */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color={COLORS.accent} />
                            <Text style={styles.locationText}>{locationText}</Text>
                        </View>
                        {/* R13 - Refresh button */}
                        <TouchableOpacity
                            onPress={fetchPrayerTimes}
                            style={styles.refreshButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="refresh-outline" size={20} color={COLORS.accent} />
                        </TouchableOpacity>
                    </View>

                    {/* Next prayer highlight */}
                    {nextPrayer && prayerTimes && !loadingPrayer && (
                        <View style={[styles.nextPrayerBanner, { flexDirection: 'column', alignItems: 'center', gap: 6 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="time-outline" size={18} color={COLORS.gold} />
                                <Text style={styles.nextPrayerText}>
                                    Sıradaki: <Text style={styles.nextPrayerName}>{PRAYER_NAMES[nextPrayer.name]}</Text>
                                    {'  '}
                                    <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                                </Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 }}>
                                <Text style={{ color: COLORS.gold, fontSize: 14, fontWeight: '700' }}>Ezana {formatTimeRemaining(nextPrayer.time)} kaldı</Text>
                            </View>
                        </View>
                    )}

                    {loadingPrayer ? (
                        <ActivityIndicator size="small" color={COLORS.accent} style={{ marginVertical: 20 }} />
                    ) : prayerTimes ? (
                        <View style={styles.prayerGrid}>
                            {PRAYER_ORDER.map((key) => {
                                const isNext = nextPrayer?.name === key;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.prayerItem, isNext && styles.prayerItemActive]}
                                        onPress={() => handlePrayerPress(key)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={PRAYER_ICONS[key] as any}
                                            size={22}
                                            color={isNext ? COLORS.gold : COLORS.accent}
                                        />
                                        <Text style={[styles.prayerName, isNext && styles.prayerNameActive]}>
                                            {PRAYER_NAMES[key]}
                                        </Text>
                                        <Text style={[styles.prayerTime, isNext && styles.prayerTimeActive]}>
                                            {prayerTimes[key]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.errorText}>Namaz vakitleri yüklenemedi.</Text>
                    )}
                </View>

                {/* ========== Daily Verse Section ========== */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="book-outline" size={20} color={COLORS.gold} />
                        <Text style={styles.sectionTitle}>Günün Ayeti</Text>
                    </View>
                    <View style={styles.verseContainer}>
                        <Text style={styles.verseText}>"{dailyVerse.text}"</Text>
                        <Text style={styles.verseRef}>
                            — {dailyVerse.surah} Suresi, Ayet {dailyVerse.ayah}
                        </Text>
                    </View>
                </View>

                {/* ========== Kandil Dates Section (R7) ========== */}
                {kandils.length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="sparkles-outline" size={20} color={COLORS.gold} />
                            <Text style={styles.sectionTitle}>Yaklaşan Kandiller</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kandilScroll}>
                            {kandils.map((kandil, index) => {
                                const daysLeft = KandilService.getDaysUntil(kandil.date);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.kandilCard}
                                        onPress={() => handleKandilPress(kandil)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name={kandil.icon as any} size={28} color={COLORS.gold} />
                                        <Text style={styles.kandilName} numberOfLines={1}>
                                            {kandil.name}
                                        </Text>
                                        <Text style={styles.kandilDate}>
                                            {new Date(kandil.date + 'T00:00:00').toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </Text>
                                        <View style={[
                                            styles.kandilBadge,
                                            daysLeft === 0 && styles.kandilBadgeToday,
                                        ]}>
                                            <Text style={[
                                                styles.kandilDays,
                                                daysLeft === 0 && styles.kandilDaysToday,
                                            ]}>
                                                {daysLeft === 0 ? 'Bugün!' : `${daysLeft} gün`}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* ========== My Chains Section ========== */}
                {myChains.length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="link-outline" size={20} color={COLORS.accent} />
                            <Text style={styles.sectionTitle}>Zincirlerim</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/chains')}
                                style={styles.seeAllButton}
                            >
                                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                                <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainsScroll}>
                            {myChains.map((chain) => {
                                const progress = ChainService.getProgress(chain);
                                return (
                                    <TouchableOpacity
                                        key={chain.id}
                                        style={styles.chainCard}
                                        onPress={() => router.push(`/chain/${chain.id}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.chainTypeTag}>
                                            <Text style={styles.chainTypeText}>
                                                {chain.type === 'hatim' ? 'Hatim' : chain.type === 'salavat' ? 'Salavat' : chain.type === 'sure' ? 'Sure' : 'Dua'}
                                            </Text>
                                        </View>
                                        <Text style={styles.chainTitle} numberOfLines={2}>
                                            {chain.title}
                                        </Text>
                                        <View style={styles.progressBarBg}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    { width: `${progress.percent}%` },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.chainProgressText}>%{progress.percent}</Text>
                                        {chain.isCompleted && (
                                            <View style={styles.completedBadge}>
                                                <Ionicons name="checkmark-circle" size={14} color={COLORS.gold} />
                                                <Text style={styles.completedText}>Tamamlandı</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* ========== Recent Chains Section ========== */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="time-outline" size={20} color={COLORS.accent} />
                        <Text style={styles.sectionTitle}>Son Eklenen Zincirler</Text>
                    </View>
                    {recentChains.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="link-outline" size={40} color={COLORS.muted} />
                            <Text style={styles.emptyText}>Henüz zincir oluşturulmamış.</Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push('/chain/create')}
                            >
                                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                <Text style={styles.createButtonText}>İlk Zinciri Oluştur</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        recentChains.map((chain) => {
                            const progress = ChainService.getProgress(chain);
                            return (
                                <TouchableOpacity
                                    key={chain.id}
                                    style={styles.recentChainItem}
                                    onPress={() => router.push(`/chain/${chain.id}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.recentChainLeft}>
                                        <View style={[
                                            styles.recentChainIcon,
                                            chain.isCompleted && { backgroundColor: 'rgba(212,175,55,0.15)' },
                                        ]}>
                                            <Ionicons
                                                name={chain.isCompleted ? 'checkmark-circle' : 'link-outline'}
                                                size={20}
                                                color={chain.isCompleted ? COLORS.gold : COLORS.accent}
                                            />
                                        </View>
                                        <View style={styles.recentChainInfo}>
                                            <Text style={styles.recentChainTitle} numberOfLines={1}>
                                                {chain.title}
                                            </Text>
                                            <Text style={styles.recentChainMeta}>
                                                {chain.createdByName} · {chain.participants.length} katılımcı
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.recentChainRight}>
                                        <Text style={styles.recentChainPercent}>%{progress.percent}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                {/* ========== Banner Ad ========== */}
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={TestIds.BANNER}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    />
                </View>

                {/* Bottom spacing for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* ========== AI Chat FAB (R2 - bottom right) ========== */}
            <TouchableOpacity
                style={[styles.fab, { bottom: 84 }]}
                onPress={() => router.push('/tools/ask-hoca')}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </TouchableOpacity>

            {/* ========== Floating Action Button ========== */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/chain/create')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },

    // Greeting
    greetingSection: {
        marginBottom: 16,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    dateText: {
        fontSize: 13,
        color: COLORS.text,
        marginTop: 4,
    },

    // Section card
    sectionCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.08)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },

    // Location
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.text,
        flex: 1,
    },

    // Refresh button (R13)
    refreshButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(112,197,187,0.1)',
    },

    // Next prayer banner
    nextPrayerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.2)',
    },
    nextPrayerText: {
        fontSize: 13,
        color: COLORS.text,
        flex: 1,
    },
    nextPrayerName: {
        fontWeight: '700',
        color: COLORS.gold,
    },
    nextPrayerTime: {
        fontWeight: '700',
        color: '#fff',
    },
    nextPrayerRemaining: {
        color: COLORS.muted,
        fontSize: 12,
    },

    // Prayer grid
    prayerGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    prayerItem: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        flex: 1,
    },
    prayerItemActive: {
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.3)',
    },
    prayerName: {
        fontSize: 11,
        color: COLORS.text,
        marginTop: 6,
        fontWeight: '600',
    },
    prayerNameActive: {
        color: COLORS.gold,
    },
    prayerTime: {
        fontSize: 13,
        color: '#fff',
        marginTop: 3,
        fontWeight: '700',
    },
    prayerTimeActive: {
        color: COLORS.gold,
    },
    errorText: {
        color: COLORS.muted,
        textAlign: 'center',
        marginVertical: 16,
        fontSize: 13,
    },

    // Daily verse
    verseContainer: {
        backgroundColor: 'rgba(212,175,55,0.06)',
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.gold,
    },
    verseText: {
        fontSize: 15,
        color: '#fff',
        lineHeight: 24,
        fontStyle: 'italic',
    },
    verseRef: {
        fontSize: 12,
        color: COLORS.gold,
        marginTop: 10,
        textAlign: 'right',
        fontWeight: '600',
    },

    // Kandil dates
    kandilScroll: {
        marginHorizontal: -4,
    },
    kandilCard: {
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 4,
        width: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.15)',
    },
    kandilName: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    kandilDate: {
        fontSize: 11,
        color: COLORS.text,
        marginTop: 4,
    },
    kandilBadge: {
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 8,
    },
    kandilBadgeToday: {
        backgroundColor: 'rgba(212,175,55,0.25)',
    },
    kandilDays: {
        fontSize: 10,
        color: COLORS.accent,
        fontWeight: '700',
    },
    kandilDaysToday: {
        color: COLORS.gold,
    },

    // My chains horizontal scroll
    chainsScroll: {
        marginHorizontal: -4,
    },
    chainCard: {
        backgroundColor: 'rgba(112,197,187,0.06)',
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 4,
        width: 150,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.12)',
    },
    chainTypeTag: {
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    chainTypeText: {
        fontSize: 10,
        color: COLORS.accent,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    chainTitle: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 10,
        minHeight: 34,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 4,
        backgroundColor: COLORS.accent,
        borderRadius: 2,
    },
    chainProgressText: {
        fontSize: 11,
        color: COLORS.text,
        marginTop: 6,
        fontWeight: '600',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    completedText: {
        fontSize: 10,
        color: COLORS.gold,
        fontWeight: '600',
    },

    // See all button
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 12,
        color: COLORS.accent,
        fontWeight: '600',
    },

    // Recent chains list
    recentChainItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(112,197,187,0.06)',
    },
    recentChainLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    recentChainIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(112,197,187,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentChainInfo: {
        flex: 1,
    },
    recentChainTitle: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    recentChainMeta: {
        fontSize: 12,
        color: COLORS.muted,
        marginTop: 2,
    },
    recentChainRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recentChainPercent: {
        fontSize: 13,
        color: COLORS.accent,
        fontWeight: '700',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        color: COLORS.muted,
        fontSize: 14,
        marginTop: 10,
        marginBottom: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // Ad container
    adContainer: {
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});
