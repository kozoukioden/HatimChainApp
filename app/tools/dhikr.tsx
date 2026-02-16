import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const STORAGE_KEY = 'HATIM_DHIKR_COUNTS';

const DHIKR_LIST = [
    { id: 'subhanallah', label: 'Sübhanallah', arabic: 'سبحان الله' },
    { id: 'elhamdulillah', label: 'Elhamdülillah', arabic: 'الحمد لله' },
    { id: 'allahuekber', label: 'Allahu Ekber', arabic: 'الله أكبر' },
    { id: 'lailaheillallah', label: 'Lâ ilâhe illallah', arabic: 'لا إله إلا الله' },
    { id: 'estagfirullah', label: 'Estağfirullah', arabic: 'أستغفر الله' },
    { id: 'subhanallahivebihamdihi', label: 'Sübhanallahi ve bihamdihi', arabic: 'سبحان الله وبحمده' },
];

interface DhikrCounts {
    [key: string]: number;
}

export default function DhikrScreen() {
    const [counts, setCounts] = useState<DhikrCounts>({});
    const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_LIST[0]);

    useEffect(() => { loadCounts(); }, []);

    const loadCounts = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCounts(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    };

    const saveCounts = async (newCounts: DhikrCounts) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
        } catch {
            // ignore
        }
    };

    const increment = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newCounts = { ...counts, [selectedDhikr.id]: (counts[selectedDhikr.id] || 0) + 1 };
        setCounts(newCounts);
        saveCounts(newCounts);
    };

    const resetCurrent = () => {
        Alert.alert(
            'Sıfırla',
            `${selectedDhikr.label} sayacını sıfırlamak istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => {
                        const newCounts = { ...counts, [selectedDhikr.id]: 0 };
                        setCounts(newCounts);
                        saveCounts(newCounts);
                    },
                },
            ]
        );
    };

    const resetAll = () => {
        Alert.alert(
            'Tümünü Sıfırla',
            'Tüm zikir sayaçlarını sıfırlamak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => {
                        setCounts({});
                        saveCounts({});
                    },
                },
            ]
        );
    };

    const currentCount = counts[selectedDhikr.id] || 0;
    const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <Stack.Screen options={{ title: 'Zikirmatik', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Total */}
                <View style={{
                    backgroundColor: '#032b23', marginHorizontal: 20, marginTop: 16, borderRadius: 16,
                    padding: 16, alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                }}>
                    <Text style={{ color: '#4a7a72', fontSize: 12, marginBottom: 4 }}>Toplam Zikir</Text>
                    <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: '800' }}>{totalCount}</Text>
                </View>

                {/* Dhikr Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
                >
                    {DHIKR_LIST.map((dhikr) => (
                        <TouchableOpacity
                            key={dhikr.id}
                            onPress={() => setSelectedDhikr(dhikr)}
                            style={{
                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                                backgroundColor: selectedDhikr.id === dhikr.id ? '#70c5bb' : '#032b23',
                                marginRight: 8,
                                borderWidth: 1,
                                borderColor: selectedDhikr.id === dhikr.id ? '#70c5bb' : 'rgba(112,197,187,0.1)',
                            }}
                        >
                            <Text style={{
                                color: selectedDhikr.id === dhikr.id ? '#01241e' : '#a8c5bf',
                                fontSize: 13, fontWeight: '600',
                            }}>
                                {dhikr.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Selected Dhikr Info */}
                <View style={{ alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
                    <Text style={{ color: '#D4AF37', fontSize: 28, fontWeight: '500', marginBottom: 8 }}>
                        {selectedDhikr.arabic}
                    </Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                        {selectedDhikr.label}
                    </Text>
                </View>

                {/* Counter Display */}
                <View style={{ alignItems: 'center', marginTop: 24 }}>
                    <Text style={{ color: '#70c5bb', fontSize: 64, fontWeight: '800' }}>
                        {currentCount}
                    </Text>
                </View>

                {/* Big Tap Button */}
                <View style={{ alignItems: 'center', marginTop: 24 }}>
                    <TouchableOpacity
                        onPress={increment}
                        activeOpacity={0.6}
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: 80,
                            backgroundColor: '#032b23',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 3,
                            borderColor: '#70c5bb',
                            shadowColor: '#70c5bb',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        <Ionicons name="add" size={56} color="#70c5bb" />
                        <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '600', marginTop: 4 }}>Dokun</Text>
                    </TouchableOpacity>
                </View>

                {/* Reset Buttons */}
                <View style={{
                    flexDirection: 'row', justifyContent: 'center',
                    marginTop: 32, gap: 12, paddingHorizontal: 20,
                }}>
                    <TouchableOpacity
                        onPress={resetCurrent}
                        style={{
                            paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
                            backgroundColor: 'rgba(112,197,187,0.1)',
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.2)',
                        }}
                    >
                        <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '600' }}>Sayacı Sıfırla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={resetAll}
                        style={{
                            paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
                            backgroundColor: 'rgba(212,175,55,0.1)',
                            borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                        }}
                    >
                        <Text style={{ color: '#D4AF37', fontSize: 14, fontWeight: '600' }}>Tümünü Sıfırla</Text>
                    </TouchableOpacity>
                </View>

                {/* Individual Counts */}
                <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
                    <Text style={{ color: '#a8c5bf', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
                        Zikir Özeti
                    </Text>
                    {DHIKR_LIST.map((dhikr) => (
                        <View
                            key={dhikr.id}
                            style={{
                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: '#032b23', borderRadius: 12, padding: 14, marginBottom: 8,
                                borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                            }}
                        >
                            <Text style={{ color: '#a8c5bf', fontSize: 14, fontWeight: '500' }}>{dhikr.label}</Text>
                            <Text style={{ color: '#70c5bb', fontSize: 16, fontWeight: '700' }}>{counts[dhikr.id] || 0}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
