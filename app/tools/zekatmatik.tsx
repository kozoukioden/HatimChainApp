import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Simulated API rates (would ideally fetch from an API)
const MOCK_RATES = {
    USD: 43.59,
    EUR: 51.79,
    GOLD_GRAM: 7314.07, // 24K Gram
    GOLD_QUARTER: 11943.19, // Ceyrek
    GOLD_HALF: 23681.08, // Yarim
    GOLD_FULL: 47362.16, // Tam
    GOLD_REPUBLIC: 48890.39, // Cumhuriyet
    GOLD_22K: 6703.73, // 22 Ayar Bilezik Gram
    SILVER: 124.03, // Gumus Gram
};

export default function ZekatmatikScreen() {
    // Assets & Inputs
    const [cashTL, setCashTL] = useState('');
    const [cashUSD, setCashUSD] = useState('');
    const [cashEUR, setCashEUR] = useState('');
    const [goldGram, setGoldGram] = useState(''); // Grams
    const [goldQuarter, setGoldQuarter] = useState(''); // Pieces
    const [goldHalf, setGoldHalf] = useState(''); // Pieces
    const [goldFull, setGoldFull] = useState(''); // Pieces
    const [goldRepublic, setGoldRepublic] = useState(''); // Pieces
    const [gold22K, setGold22K] = useState(''); // Grams
    const [silver, setSilver] = useState(''); // Grams
    const [otherAssets, setOtherAssets] = useState(''); // TL Value
    const [receivables, setReceivables] = useState(''); // TL Value

    // Debts
    const [debts, setDebts] = useState(''); // TL Value

    // Results
    const [totalWealth, setTotalWealth] = useState(0);
    const [nisabAmount, setNisabAmount] = useState(0); // 80.18g Gold equivalent
    const [zakatAmount, setZakatAmount] = useState(0);
    const [eligible, setEligible] = useState(false);

    // Live Rates State (Mock)
    const [rates, setRates] = useState(MOCK_RATES);

    useEffect(() => {
        // Here we would fetch live rates
        // For now, we use the simulated ones which are "live" enough for the demo
        calculateNisab();
    }, []);

    const calculateNisab = () => {
        // Nisab is usually 80.18 grams of gold
        const nisab = 80.18 * rates.GOLD_GRAM;
        setNisabAmount(nisab);
    };

    const handleCalculate = () => {
        // Convert all to TL
        let total = 0;

        total += (parseFloat(cashTL) || 0);
        total += (parseFloat(cashUSD) || 0) * rates.USD;
        total += (parseFloat(cashEUR) || 0) * rates.EUR;

        // Gold
        total += (parseFloat(goldGram) || 0) * rates.GOLD_GRAM;
        total += (parseFloat(goldQuarter) || 0) * rates.GOLD_QUARTER;
        total += (parseFloat(goldHalf) || 0) * rates.GOLD_HALF;
        total += (parseFloat(goldFull) || 0) * rates.GOLD_FULL;
        total += (parseFloat(goldRepublic) || 0) * rates.GOLD_REPUBLIC;
        total += (parseFloat(gold22K) || 0) * rates.GOLD_22K;

        // Silver
        total += (parseFloat(silver) || 0) * rates.SILVER;

        // Other
        total += (parseFloat(otherAssets) || 0);
        total += (parseFloat(receivables) || 0);

        // Deduct Debts
        const debtAmount = parseFloat(debts) || 0;
        const netWealth = total - debtAmount;

        setTotalWealth(netWealth);

        if (netWealth >= nisabAmount) {
            setEligible(true);
            setZakatAmount(netWealth * 0.025); // 1/40
        } else {
            setEligible(false);
            setZakatAmount(0);
        }
    };

    const handleClear = () => {
        setCashTL(''); setCashUSD(''); setCashEUR('');
        setGoldGram(''); setGoldQuarter(''); setGoldHalf(''); setGoldFull(''); setGoldRepublic(''); setGold22K('');
        setSilver(''); setOtherAssets(''); setReceivables('');
        setDebts('');
        setTotalWealth(0);
        setZakatAmount(0);
        setEligible(false);
    };

    const renderInput = (label: string, value: string, setValue: (s: string) => void, placeholder: string = '0', rate?: number, unit?: string) => (
        <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#4a7a72', fontSize: 13, fontWeight: '600' }}>{label}</Text>
                {rate ? (
                    <Text style={{ color: '#70c5bb', fontSize: 11 }}>
                        {rate.toFixed(2)} TL{unit ? `/${unit}` : ''}
                    </Text>
                ) : null}
            </View>
            <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                placeholderTextColor="#4a7a72"
                keyboardType="numeric"
                style={{
                    backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                    color: '#fff', fontSize: 15,
                    borderWidth: 1, borderColor: value ? '#70c5bb' : 'rgba(112,197,187,0.1)',
                }}
            />
        </View>
    );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#01241e' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <StatusBar style="light" />
            <Stack.Screen options={{ title: 'Zekatmatik', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />

            {/* Header / Nisab Info */}
            <View style={{ backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#D4AF37' }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>Nisab Miktarı</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 13, marginBottom: 8 }}>
                    Diyanet işlerine göre 80.18 gram altın değeridir. Bu tutarın üzerinde mal varlığınız varsa zekat vermeniz gerekir.
                </Text>
                <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: '700' }}>
                    {nisabAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                </Text>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20 }}>
                <Text style={{ color: '#01241e', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Varlıklar ve Alacaklar</Text>

                {renderInput('Türk Lirası (Nakit/Banka)', cashTL, setCashTL)}
                {renderInput('Amerikan Doları', cashUSD, setCashUSD, '0', rates.USD)}
                {renderInput('Euro', cashEUR, setCashEUR, '0', rates.EUR)}

                <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />
                <Text style={{ color: '#01241e', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Altın & Kıymetli Madenler</Text>

                {renderInput('Gram Altın (24 Ayar)', goldGram, setGoldGram, '0 Gr', rates.GOLD_GRAM, 'Gr')}
                {renderInput('Çeyrek Altın', goldQuarter, setGoldQuarter, '0 Adet', rates.GOLD_QUARTER, 'Adet')}
                {renderInput('Yarım Altın', goldHalf, setGoldHalf, '0 Adet', rates.GOLD_HALF, 'Adet')}
                {renderInput('Tam Altın', goldFull, setGoldFull, '0 Adet', rates.GOLD_FULL, 'Adet')}
                {renderInput('Cumhuriyet Altını', goldRepublic, setGoldRepublic, '0 Adet', rates.GOLD_REPUBLIC, 'Adet')}
                {renderInput('22 Ayar Bilezik', gold22K, setGold22K, '0 Gr', rates.GOLD_22K, 'Gr')}
                {renderInput('Gümüş', silver, setSilver, '0 Gr', rates.SILVER, 'Gr')}

                <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 10 }} />

                {renderInput('Diğer Varlıklar (Ticari Mal, Hisse vb.)', otherAssets, setOtherAssets, 'TL Değeri')}
                {renderInput('Kesin Alacaklar', receivables, setReceivables, 'TL Değeri')}

                <Text style={{ color: '#01241e', fontSize: 18, fontWeight: '700', marginBottom: 16, marginTop: 10 }}>Borçlar</Text>
                {renderInput('Toplam Borçlarınız (1 Yıllık)', debts, setDebts, 'TL Değeri')}

                {/* Calculate Buttons */}
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={handleClear}
                        style={{ flex: 1, backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, marginRight: 8, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#ef4444', fontWeight: '700' }}>TEMİZLE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleCalculate}
                        style={{ flex: 2, backgroundColor: '#70c5bb', padding: 16, borderRadius: 12, marginLeft: 8, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#01241e', fontWeight: '700' }}>HESAPLA</Text>
                    </TouchableOpacity>
                </View>

                {/* Result */}
                {totalWealth > 0 && (
                    <View style={{ marginTop: 24, padding: 16, backgroundColor: eligible ? '#ecfdf5' : '#fffbeb', borderRadius: 12, borderWidth: 1, borderColor: eligible ? '#10b981' : '#f59e0b' }}>
                        <Text style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>Net Varlık Toplamı</Text>
                        <Text style={{ color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 12 }}>{totalWealth.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL</Text>

                        <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 12 }} />

                        <Text style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>
                            {eligible ? 'Verilmesi Gereken Zekat (1/40)' : 'Zekat Durumu'}
                        </Text>

                        {eligible ? (
                            <Text style={{ color: '#047857', fontSize: 28, fontWeight: '800' }}>
                                {zakatAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                            </Text>
                        ) : (
                            <Text style={{ color: '#b45309', fontSize: 16, fontWeight: '600' }}>
                                Nisab miktarının altında kaldığı için zekat gerekmez.
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
