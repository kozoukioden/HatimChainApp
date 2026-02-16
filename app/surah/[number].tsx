import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrayerService, Ayah } from '../../services/api';

export default function SurahDetailScreen() {
    const { number } = useLocalSearchParams<{ number: string }>();
    const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
    const [turkishTexts, setTurkishTexts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [surahName, setSurahName] = useState('');

    useEffect(() => {
        if (number) loadSurah();
    }, [number]);

    const loadSurah = async () => {
        if (!number) return;
        setLoading(true);
        setError(false);

        try {
            const surahs = await PrayerService.getSurahs();
            if (surahs && surahs.length > 0) {
                const surah = surahs.find(s => s.number === parseInt(number));
                if (surah) setSurahName(surah.englishName);
            }

            const data = await PrayerService.getSurahAyahs(parseInt(number));
            if (data && data.arabic && data.arabic.length > 0) {
                setArabicAyahs(data.arabic);
                setTurkishTexts(data.turkish || []);
            } else {
                setError(true);
            }
        } catch (e) {
            console.error('Surah loading error:', e);
            setError(true);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }} edges={['bottom']}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#70c5bb" />
                <Text style={{ color: '#a8c5bf', marginTop: 12 }}>Ayetler yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    if (error || arabicAyahs.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', padding: 40 }} edges={['bottom']}>
                <StatusBar style="light" />
                <Ionicons name="cloud-offline-outline" size={64} color="#4a7a72" />
                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                    Ayetler yüklenemedi.{'\n'}İnternet bağlantınızı kontrol edin.
                </Text>
                <TouchableOpacity
                    onPress={loadSurah}
                    style={{ backgroundColor: '#70c5bb', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, marginTop: 24 }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#01241e', fontWeight: '700', fontSize: 16 }}>Tekrar Dene</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e' }} edges={['bottom']}>
            <StatusBar style="light" />
            <FlatList
                data={arabicAyahs}
                keyExtractor={item => (item?.numberInSurah || Math.random()).toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                ListHeaderComponent={
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ color: '#D4AF37', fontSize: 28, fontWeight: '700', marginBottom: 4 }}>{surahName || `Sure ${number}`}</Text>
                        <Text style={{ color: '#a8c5bf', fontSize: 14 }}>{arabicAyahs.length} Ayet</Text>
                        {number && parseInt(number) !== 1 && parseInt(number) !== 9 && (
                            <View style={{ backgroundColor: '#0a3d32', borderRadius: 16, padding: 20, marginTop: 16, width: '100%' }}>
                                <Text style={{ color: '#D4AF37', fontSize: 22, textAlign: 'center', lineHeight: 36 }}>
                                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item, index }) => {
                    if (!item) return null;
                    return (
                        <View style={{
                            backgroundColor: '#032b23', borderRadius: 16, padding: 20, marginBottom: 12,
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                                <View style={{
                                    width: 32, height: 32, borderRadius: 16,
                                    backgroundColor: 'rgba(112,197,187,0.1)',
                                    justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <Text style={{ color: '#70c5bb', fontSize: 13, fontWeight: '700' }}>{item.numberInSurah || index + 1}</Text>
                                </View>
                            </View>
                            <Text style={{
                                color: '#D4AF37', fontSize: 24, textAlign: 'right',
                                lineHeight: 44, marginBottom: 16, fontWeight: '500',
                            }}>
                                {item.text || ''}
                            </Text>
                            {turkishTexts[index] ? (
                                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 24 }}>
                                    {turkishTexts[index]}
                                </Text>
                            ) : null}
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}
