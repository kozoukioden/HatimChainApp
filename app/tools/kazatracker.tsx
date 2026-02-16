import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Slider removed — using +/- buttons and direct text input instead

const STORAGE_KEY = 'HATIM_KAZA_TRACKER';

const PRAYER_TYPES = [
    { id: 'sabah', label: 'Sabah', icon: 'sunny-outline' },
    { id: 'ogle', label: 'Öğle', icon: 'partly-sunny-outline' },
    { id: 'ikindi', label: 'İkindi', icon: 'cloud-outline' },
    { id: 'aksam', label: 'Akşam', icon: 'moon-outline' },
    { id: 'yatsi', label: 'Yatsı', icon: 'cloudy-night-outline' },
];

interface KazaCounts {
    [key: string]: number;
}

export default function KazaTrackerScreen() {
    const [counts, setCounts] = useState<KazaCounts>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

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

    const saveCounts = async (newCounts: KazaCounts) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCounts));
        } catch {
            // ignore
        }
    };

    const increment = (id: string) => {
        const newCounts = { ...counts, [id]: (counts[id] || 0) + 1 };
        setCounts(newCounts);
        saveCounts(newCounts);
    };

    const decrement = (id: string) => {
        const current = counts[id] || 0;
        if (current <= 0) return;
        const newCounts = { ...counts, [id]: current - 1 };
        setCounts(newCounts);
        saveCounts(newCounts);
    };

    const startEditing = (id: string) => {
        setEditingId(id);
        setEditValue(String(counts[id] || 0));
    };

    const finishEditing = (id: string) => {
        const num = parseInt(editValue) || 0;
        const newCounts = { ...counts, [id]: Math.max(0, num) };
        setCounts(newCounts);
        saveCounts(newCounts);
        setEditingId(null);
    };

    const resetAll = () => {
        Alert.alert(
            'Sıfırla',
            'Tüm kaza namazlarını sıfırlamak istediğinize emin misiniz?',
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

    const totalMissed = Object.values(counts).reduce((sum, c) => sum + c, 0);

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <Stack.Screen options={{ title: 'Kaza Takibi', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
                {/* Total Summary */}
                <View style={{
                    backgroundColor: '#032b23', borderRadius: 18, padding: 20, marginBottom: 20,
                    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                }}>
                    <Text style={{ color: '#4a7a72', fontSize: 13, marginBottom: 6 }}>Toplam Kaza Namazı</Text>
                    <Text style={{ color: totalMissed > 0 ? '#D4AF37' : '#70c5bb', fontSize: 42, fontWeight: '800' }}>
                        {totalMissed}
                    </Text>
                    <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 4 }}>
                        {totalMissed === 0 ? 'Harika! Kaza namazınız yok.' : 'vakit kaza namazınız var'}
                    </Text>
                </View>

                {/* Info */}
                <View style={{
                    backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: 12, padding: 12, marginBottom: 16,
                    flexDirection: 'row', alignItems: 'center',
                }}>
                    <Ionicons name="information-circle-outline" size={18} color="#D4AF37" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#a8c5bf', fontSize: 12, flex: 1 }}>
                        Sayıya dokunarak doğrudan değer girebilirsiniz.
                    </Text>
                </View>

                {/* Prayer List */}
                {PRAYER_TYPES.map((prayer) => {
                    const count = counts[prayer.id] || 0;
                    const isEditing = editingId === prayer.id;
                    return (
                        <View
                            key={prayer.id}
                            style={{
                                backgroundColor: '#032b23', borderRadius: 16, padding: 18, marginBottom: 10,
                                borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={{
                                    width: 44, height: 44, borderRadius: 14,
                                    backgroundColor: 'rgba(112,197,187,0.08)',
                                    justifyContent: 'center', alignItems: 'center', marginRight: 14,
                                }}>
                                    <Ionicons name={prayer.icon as any} size={22} color="#70c5bb" />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{prayer.label}</Text>
                                    <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>
                                        {count === 0 ? 'Kaza yok' : `${count} vakit kaza`}
                                    </Text>
                                </View>

                                {isEditing ? (
                                    <TextInput
                                        value={editValue}
                                        onChangeText={setEditValue}
                                        onBlur={() => finishEditing(prayer.id)}
                                        onSubmitEditing={() => finishEditing(prayer.id)}
                                        keyboardType="numeric"
                                        autoFocus
                                        selectTextOnFocus
                                        style={{
                                            color: '#D4AF37', fontSize: 22, fontWeight: '800',
                                            minWidth: 50, textAlign: 'center',
                                            backgroundColor: '#01241e', borderRadius: 8,
                                            paddingHorizontal: 8, paddingVertical: 2,
                                            borderWidth: 1, borderColor: '#D4AF37',
                                        }}
                                    />
                                ) : (
                                    <TouchableOpacity onPress={() => startEditing(prayer.id)}>
                                        <Text style={{
                                            color: count > 0 ? '#D4AF37' : '#4a7a72',
                                            fontSize: 22, fontWeight: '800', minWidth: 40, textAlign: 'center',
                                        }}>
                                            {count}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Buttons Control */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => decrement(prayer.id)}
                                    style={{
                                        width: 38, height: 38, borderRadius: 12,
                                        backgroundColor: count > 0 ? 'rgba(112,197,187,0.1)' : 'rgba(112,197,187,0.04)',
                                        justifyContent: 'center', alignItems: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.15)',
                                    }}
                                >
                                    <Ionicons name="remove" size={20} color={count > 0 ? '#70c5bb' : '#4a7a72'} />
                                </TouchableOpacity>

                                {/* Quick-add buttons */}
                                {[10, 50].map((amt) => (
                                    <TouchableOpacity
                                        key={amt}
                                        onPress={() => {
                                            const newCounts = { ...counts, [prayer.id]: (counts[prayer.id] || 0) + amt };
                                            setCounts(newCounts);
                                            saveCounts(newCounts);
                                        }}
                                        style={{
                                            paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
                                            backgroundColor: 'rgba(212,175,55,0.1)',
                                            borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                                        }}
                                    >
                                        <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '700' }}>+{amt}</Text>
                                    </TouchableOpacity>
                                ))}

                                <View style={{ flex: 1 }} />

                                <TouchableOpacity
                                    onPress={() => increment(prayer.id)}
                                    style={{
                                        width: 38, height: 38, borderRadius: 12,
                                        backgroundColor: '#70c5bb',
                                        justifyContent: 'center', alignItems: 'center',
                                    }}
                                >
                                    <Ionicons name="add" size={20} color="#01241e" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}

                {/* Reset Button */}
                <TouchableOpacity
                    onPress={resetAll}
                    style={{
                        marginTop: 20, paddingVertical: 14, borderRadius: 14,
                        backgroundColor: 'rgba(212,175,55,0.1)',
                        borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#D4AF37', fontSize: 15, fontWeight: '700' }}>Tümünü Sıfırla</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
