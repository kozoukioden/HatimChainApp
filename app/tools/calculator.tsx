import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const SURE_OPTIONS = [
    { name: 'İhlas', ayahs: 4 },
    { name: 'Ayetül Kürsi', ayahs: 1 },
    { name: 'Salatı Nariye', ayahs: 1 },
    { name: 'Tevhid', ayahs: 1 },
    { name: 'Vellahu Galibun', ayahs: 1 },
    { name: 'Yasin', ayahs: 83 },
    { name: 'Fatiha', ayahs: 7 },
    { name: 'Mülk', ayahs: 30 },
];

const TOTAL_QURAN_AYAHS = 6236;

export default function CalculatorScreen() {
    const [selectedSure, setSelectedSure] = useState<string>('');
    const [customSure, setCustomSure] = useState('');
    const [customAyahs, setCustomAyahs] = useState('');
    const [personCount, setPersonCount] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isCustom, setIsCustom] = useState(false);

    const handleCalculate = () => {
        let sureName = isCustom ? customSure : selectedSure;
        if (!sureName) {
            Alert.alert('Uyarı', 'Lütfen bir sure seçin.');
            return;
        }

        const persons = parseInt(personCount);
        if (!persons || persons < 1) {
            Alert.alert('Uyarı', 'Lütfen kişi sayısı girin.');
            return;
        }

        let ayahCount = 0;
        if (isCustom) {
            ayahCount = parseInt(customAyahs) || 1;
        } else {
            const found = SURE_OPTIONS.find(s => s.name === selectedSure);
            ayahCount = found ? found.ayahs : 1;
        }

        const totalNeeded = Math.ceil(TOTAL_QURAN_AYAHS / ayahCount);
        const perPerson = Math.ceil(totalNeeded / persons);

        setResult(
            `1 hatim için toplam ${totalNeeded} adet ${sureName} okunması gerekir.\n\n` +
            `${persons} kişi ile herkes ${perPerson} adet ${sureName} okuyacak.`
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="calculator-outline" size={32} color="#D4AF37" />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Hatim Hesaplayıcı</Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                        Kaç kişi ile kaçar adet okuyacağınızı hesaplayın
                    </Text>
                </View>

                {/* Sure Selection */}
                <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 10 }}>Sure Seçimi</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                    {SURE_OPTIONS.map(s => {
                        const isSelected = !isCustom && selectedSure === s.name;
                        return (
                            <TouchableOpacity
                                key={s.name}
                                onPress={() => { setSelectedSure(s.name); setIsCustom(false); }}
                                style={{
                                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, marginBottom: 8,
                                    backgroundColor: isSelected ? 'rgba(112,197,187,0.15)' : '#032b23',
                                    borderWidth: 1.5, borderColor: isSelected ? '#70c5bb' : 'rgba(112,197,187,0.08)',
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: isSelected ? '#70c5bb' : '#a8c5bf', fontSize: 13, fontWeight: '600' }}>{s.name}</Text>
                                <Text style={{ color: '#4a7a72', fontSize: 10, marginTop: 2 }}>{s.ayahs} ayet</Text>
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity
                        onPress={() => { setIsCustom(true); setSelectedSure(''); }}
                        style={{
                            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, marginBottom: 8,
                            backgroundColor: isCustom ? 'rgba(212,175,55,0.15)' : '#032b23',
                            borderWidth: 1.5, borderColor: isCustom ? '#D4AF37' : 'rgba(112,197,187,0.08)',
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={{ color: isCustom ? '#D4AF37' : '#a8c5bf', fontSize: 13, fontWeight: '600' }}>Diğer</Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Sure Fields */}
                {isCustom && (
                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            value={customSure}
                            onChangeText={setCustomSure}
                            placeholder="Sure adı girin"
                            placeholderTextColor="#4a7a72"
                            style={{
                                backgroundColor: '#032b23', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, marginBottom: 10,
                                borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                            }}
                        />
                        <TextInput
                            value={customAyahs}
                            onChangeText={setCustomAyahs}
                            placeholder="Ayet sayısı"
                            placeholderTextColor="#4a7a72"
                            keyboardType="numeric"
                            style={{
                                backgroundColor: '#032b23', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15,
                                borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                            }}
                        />
                    </View>
                )}

                {/* Person Count */}
                <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 }}>Kişi Sayısı</Text>
                <TextInput
                    value={personCount}
                    onChangeText={setPersonCount}
                    placeholder="Örn: 10"
                    placeholderTextColor="#4a7a72"
                    keyboardType="numeric"
                    style={{
                        backgroundColor: '#032b23', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, marginBottom: 24,
                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                    }}
                />

                {/* Calculate Button */}
                <TouchableOpacity
                    onPress={handleCalculate}
                    style={{
                        backgroundColor: '#70c5bb', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 24,
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#01241e', fontSize: 17, fontWeight: '700' }}>Hesapla</Text>
                </TouchableOpacity>

                {/* Result */}
                {result && (
                    <View style={{
                        backgroundColor: '#0a3d32', borderRadius: 20, padding: 24,
                        borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons name="checkmark-circle" size={22} color="#D4AF37" />
                            <Text style={{ color: '#D4AF37', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>Sonuç</Text>
                        </View>
                        <Text style={{ color: '#fff', fontSize: 16, lineHeight: 26 }}>{result}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
