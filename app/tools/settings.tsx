import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NotificationService, NotificationSettings } from '../../services/notifications';

export default function SettingsScreen() {
    const [settings, setSettings] = useState<NotificationSettings>({
        prayerNotifications: false,
        chainNotifications: false,
        prayerMinutesBefore: 10,
        dailyPrayerSummary: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const s = await NotificationService.getSettings();
        setSettings(s);
    };

    const updateSetting = async (key: keyof NotificationSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await NotificationService.saveSettings(newSettings);

        if (key === 'prayerNotifications' && value) {
            const granted = await NotificationService.registerForPushNotifications();
            if (!granted) {
                Alert.alert('İzin Gerekli', 'Bildirimler için izin vermeniz gerekiyor.');
                setSettings(prev => ({ ...prev, prayerNotifications: false }));
                await NotificationService.saveSettings({ ...newSettings, prayerNotifications: false });
            }
        }
        if (key === 'chainNotifications' && value) {
            const granted = await NotificationService.registerForPushNotifications();
            if (!granted) {
                Alert.alert('İzin Gerekli', 'Bildirimler için izin vermeniz gerekiyor.');
                setSettings(prev => ({ ...prev, chainNotifications: false }));
                await NotificationService.saveSettings({ ...newSettings, chainNotifications: false });
            }
        }
        if (key === 'dailyPrayerSummary' && value) {
            const granted = await NotificationService.registerForPushNotifications();
            if (!granted) {
                Alert.alert('İzin Gerekli', 'Bildirimler için izin vermeniz gerekiyor.');
                setSettings(prev => ({ ...prev, dailyPrayerSummary: false }));
                await NotificationService.saveSettings({ ...newSettings, dailyPrayerSummary: false });
            }
        }
    };

    const MINUTES_OPTIONS = [5, 10, 15, 30];

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Notification Settings */}
                <Text style={{ color: '#70c5bb', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>BİLDİRİM AYARLARI</Text>

                <View style={{ backgroundColor: '#032b23', borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                        <Ionicons name="time-outline" size={22} color="#70c5bb" />
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Namaz Bildirimi</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>Namaz vaktinden önce hatırlatma</Text>
                        </View>
                        <Switch
                            value={settings.prayerNotifications}
                            onValueChange={v => updateSetting('prayerNotifications', v)}
                            trackColor={{ false: '#4a7a72', true: 'rgba(112,197,187,0.4)' }}
                            thumbColor={settings.prayerNotifications ? '#70c5bb' : '#a8c5bf'}
                        />
                    </View>

                    {settings.prayerNotifications && (
                        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 12, marginBottom: 8 }}>Kaç dakika önce hatırlatsın?</Text>
                            <View style={{ flexDirection: 'row' }}>
                                {MINUTES_OPTIONS.map(min => (
                                    <TouchableOpacity
                                        key={min}
                                        onPress={() => updateSetting('prayerMinutesBefore', min)}
                                        style={{
                                            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginRight: 8,
                                            backgroundColor: settings.prayerMinutesBefore === min ? '#70c5bb' : '#01241e',
                                        }}
                                    >
                                        <Text style={{
                                            color: settings.prayerMinutesBefore === min ? '#01241e' : '#a8c5bf',
                                            fontWeight: '600', fontSize: 13,
                                        }}>{min} dk</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={{ height: 1, backgroundColor: 'rgba(112,197,187,0.06)', marginHorizontal: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                        <Ionicons name="notifications-outline" size={22} color="#70c5bb" />
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Sabit Bildirim (Günlük Özet)</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>Bildirim panelinde günlük namaz vakitleri</Text>
                        </View>
                        <Switch
                            value={settings.dailyPrayerSummary}
                            onValueChange={v => updateSetting('dailyPrayerSummary', v)}
                            trackColor={{ false: '#4a7a72', true: 'rgba(112,197,187,0.4)' }}
                            thumbColor={settings.dailyPrayerSummary ? '#70c5bb' : '#a8c5bf'}
                        />
                    </View>

                    <View style={{ height: 1, backgroundColor: 'rgba(112,197,187,0.06)', marginHorizontal: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                        <Ionicons name="link-outline" size={22} color="#70c5bb" />
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Zincir Bildirimi</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>Zincir bitiş tarihi yaklaşınca uyarı</Text>
                        </View>
                        <Switch
                            value={settings.chainNotifications}
                            onValueChange={v => updateSetting('chainNotifications', v)}
                            trackColor={{ false: '#4a7a72', true: 'rgba(112,197,187,0.4)' }}
                            thumbColor={settings.chainNotifications ? '#70c5bb' : '#a8c5bf'}
                        />
                    </View>
                </View>

                {/* Support */}
                <Text style={{ color: '#70c5bb', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>DESTEK</Text>

                <TouchableOpacity
                    onPress={() => Linking.openURL('https://www.shopier.com/hmsoftwarestudio#Ba%C4%9F%C4%B1%C5%9F')}
                    style={{
                        backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 10,
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart" size={22} color="#D4AF37" />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ color: '#D4AF37', fontSize: 15, fontWeight: '700' }}>Bağış / Destek</Text>
                        <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>Uygulama geliştirmeye destek olun</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#4a7a72" />
                </TouchableOpacity>

                {/* About */}
                <Text style={{ color: '#70c5bb', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 16 }}>HAKKINDA</Text>

                <View style={{
                    backgroundColor: '#032b23', borderRadius: 16, padding: 24, marginBottom: 16,
                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)', alignItems: 'center',
                }}>
                    <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Hatim Zinciri</Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 14, marginBottom: 8 }}>Sürüm 1.0.0</Text>
                    <Text style={{ color: '#4a7a72', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                        Sosyal Manevi İbadet Platformu{'\n'}
                        Zincirler Kurulsun, Dualar Kabul Olsun
                    </Text>
                </View>

                {/* Privacy Policy */}
                <TouchableOpacity
                    onPress={() => Alert.alert('Gizlilik Politikası', 'Hatim Zinciri uygulaması kullanıcı verilerinizi güvenli şekilde saklar. Verileriniz üçüncü taraflarla paylaşılmaz. Tüm veriler cihazınızda yerel olarak depolanır.')}
                    style={{
                        backgroundColor: '#032b23', borderRadius: 16, padding: 16,
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="shield-checkmark-outline" size={22} color="#70c5bb" />
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 14, flex: 1 }}>Gizlilik Politikası</Text>
                    <Ionicons name="chevron-forward" size={18} color="#4a7a72" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
