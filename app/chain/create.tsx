import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/auth';
import { ChainService, ChainType } from '../../services/chains';

const CHAIN_TYPES: { key: ChainType; label: string; icon: string; description: string; defaultParts: number }[] = [
    { key: 'hatim', label: 'Hatim', icon: 'book', description: "Kur'an-ı Kerim'in 30 cüzünü paylaştırın", defaultParts: 30 },
    { key: 'salavat', label: 'Salavat', icon: 'heart', description: 'Salavat zinciri oluşturun', defaultParts: 100 },
    { key: 'sure', label: 'Sure', icon: 'document-text', description: 'Belirli bir sureyi toplu okuyun', defaultParts: 41 },
    { key: 'dua', label: 'Dua', icon: 'hand-left', description: 'Dua zinciri başlatın', defaultParts: 100 },
    { key: 'topludua', label: 'Toplu Dua', icon: 'megaphone', description: 'Toplu dua zinciri oluşturun', defaultParts: 100 },
];

const SURE_LIST = [
    'Kevser', 'Kâfirûn', 'Nasr', 'Tebbet', 'İhlâs', 'Felak', 'Nâs',
    'Fil', 'Kureyş', 'Maûn', 'Asr', 'Hümeze', 'Tin', 'Alak', 'Kadir',
    'Beyyine', 'Zilzâl', 'Âdiyât', 'Kâria', 'Tekâsür'
];

function getDefault30DaysFromNow() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return {
        day: String(d.getDate()).padStart(2, '0'),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        year: String(d.getFullYear()),
        hour: String(d.getHours()).padStart(2, '0'),
        minute: String(d.getMinutes()).padStart(2, '0'),
    };
}

export default function CreateChainScreen() {
    const [selectedType, setSelectedType] = useState<ChainType | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [totalParts, setTotalParts] = useState('');
    const [loading, setLoading] = useState(false);

    // Sure selection state
    const [sureName, setSureName] = useState('');
    const [customSureName, setCustomSureName] = useState('');

    // Toplu Dua state
    const [niyetDescription, setNiyetDescription] = useState('');
    const [liveStreamUrl, setLiveStreamUrl] = useState('');
    const [hiddenParticipants, setHiddenParticipants] = useState(false);

    // End date state
    const defaults = getDefault30DaysFromNow();
    const [endDay, setEndDay] = useState(defaults.day);
    const [endMonth, setEndMonth] = useState(defaults.month);
    const [endYear, setEndYear] = useState(defaults.year);
    const [endHour, setEndHour] = useState(defaults.hour);
    const [endMinute, setEndMinute] = useState(defaults.minute);

    const selectedTypeInfo = CHAIN_TYPES.find(t => t.key === selectedType);

    const handleCreate = async () => {
        if (!selectedType) { Alert.alert('Uyarı', 'Lütfen bir zincir türü seçin.'); return; }
        if (!title.trim()) { Alert.alert('Uyarı', 'Lütfen bir başlık girin.'); return; }

        // Validate sure selection
        if (selectedType === 'sure') {
            const finalSureName = sureName === 'Diğer' ? customSureName.trim() : sureName;
            if (!finalSureName) {
                Alert.alert('Uyarı', 'Lütfen bir sure seçin.');
                return;
            }
        }

        // Validate end date
        const dayNum = parseInt(endDay);
        const monthNum = parseInt(endMonth);
        const yearNum = parseInt(endYear);
        const hourNum = parseInt(endHour);
        const minuteNum = parseInt(endMinute);

        if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) { Alert.alert('Uyarı', 'Geçerli bir gün girin (01-31).'); return; }
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) { Alert.alert('Uyarı', 'Geçerli bir ay girin (01-12).'); return; }
        if (isNaN(yearNum) || endYear.length !== 4) { Alert.alert('Uyarı', 'Geçerli bir yıl girin (4 haneli).'); return; }
        if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) { Alert.alert('Uyarı', 'Geçerli bir saat girin (00-23).'); return; }
        if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) { Alert.alert('Uyarı', 'Geçerli bir dakika girin (00-59).'); return; }

        const endDate = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
        if (endDate <= new Date()) {
            Alert.alert('Uyarı', 'Bitiş tarihi gelecekte olmalıdır.');
            return;
        }

        const user = await AuthService.getCurrentUser();
        if (!user) { Alert.alert('Hata', 'Giriş yapmanız gerekiyor.'); return; }

        const parts = selectedType === 'hatim' ? 30 : parseInt(totalParts) || selectedTypeInfo?.defaultParts || 30;

        setLoading(true);
        try {
            const today = new Date();
            const finalSureName = sureName === 'Diğer' ? customSureName.trim() : sureName;

            const chain = await ChainService.createChain({
                type: selectedType,
                title: title.trim(),
                description: description.trim(),
                createdBy: user.id,
                createdByName: user.fullName,
                startDate: today.toISOString().split('T')[0],
                endDate: endDate.toISOString(),
                totalParts: parts,
                sureName: selectedType === 'sure' ? finalSureName : undefined,
                liveStreamUrl: selectedType === 'topludua' ? liveStreamUrl.trim() : undefined,
                niyetDescription: selectedType === 'topludua' ? niyetDescription.trim() : undefined,
                hiddenParticipants: selectedType === 'topludua' ? hiddenParticipants : undefined,
            });

            setLoading(false);
            Alert.alert('Başarılı', 'Zincir oluşturuldu!', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        // Use replace to prevent going back to create screen and ensure fresh navigation
                        if (chain && chain.id) {
                            router.replace(`/chain/${chain.id}`);
                        } else {
                            // Fallback if ID is missing (should not happen)
                            router.back();
                        }
                    },
                },
            ]);
        } catch (e) {
            setLoading(false);
            console.error(e);
            Alert.alert('Hata', 'Zincir oluşturulurken bir hata oluştu.');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

                {/* Type Selection */}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Zincir Türü</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                    {CHAIN_TYPES.map(type => {
                        const isSelected = selectedType === type.key;
                        return (
                            <TouchableOpacity
                                key={type.key}
                                onPress={() => {
                                    setSelectedType(type.key);
                                    if (type.key === 'hatim') setTotalParts('30');
                                    else setTotalParts(type.defaultParts.toString());
                                }}
                                style={{
                                    width: '48%', marginBottom: 10, marginRight: '2%',
                                    backgroundColor: isSelected ? 'rgba(112,197,187,0.15)' : '#032b23',
                                    borderRadius: 16, padding: 18,
                                    borderWidth: 2, borderColor: isSelected ? '#70c5bb' : 'rgba(112,197,187,0.08)',
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={type.icon as any} size={28} color={isSelected ? '#70c5bb' : '#4a7a72'} />
                                <Text style={{ color: isSelected ? '#70c5bb' : '#fff', fontSize: 16, fontWeight: '700', marginTop: 10 }}>{type.label}</Text>
                                <Text style={{ color: '#a8c5bf', fontSize: 11, marginTop: 4, lineHeight: 16 }}>{type.description}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Title */}
                <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Başlık</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Örn: Ramazan Hatim Zinciri"
                    placeholderTextColor="#4a7a72"
                    style={{
                        backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                        color: '#fff', fontSize: 15, marginBottom: 18,
                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                    }}
                />

                {/* Description */}
                <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Açıklama (İsteğe bağlı)</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Zincir hakkında kısa bir açıklama..."
                    placeholderTextColor="#4a7a72"
                    multiline
                    numberOfLines={3}
                    style={{
                        backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                        color: '#fff', fontSize: 15, marginBottom: 18, minHeight: 80, textAlignVertical: 'top',
                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                    }}
                />

                {/* Sure Selection - only for 'sure' type */}
                {selectedType === 'sure' && (
                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>Sure Seçimi</Text>
                        <View style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)' }}>
                            {SURE_LIST.map((sure) => {
                                const isSelected = sureName === sure;
                                return (
                                    <TouchableOpacity
                                        key={sure}
                                        onPress={() => setSureName(sure)}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center',
                                            paddingVertical: 10, paddingHorizontal: 8,
                                            borderBottomWidth: 1, borderBottomColor: 'rgba(112,197,187,0.06)',
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{
                                            width: 22, height: 22, borderRadius: 11,
                                            borderWidth: 2, borderColor: isSelected ? '#70c5bb' : '#4a7a72',
                                            alignItems: 'center', justifyContent: 'center', marginRight: 12,
                                        }}>
                                            {isSelected && (
                                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#70c5bb' }} />
                                            )}
                                        </View>
                                        <Text style={{ color: isSelected ? '#70c5bb' : '#fff', fontSize: 15 }}>{sure}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {/* Diğer option */}
                            <TouchableOpacity
                                onPress={() => setSureName('Diğer')}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 10, paddingHorizontal: 8,
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={{
                                    width: 22, height: 22, borderRadius: 11,
                                    borderWidth: 2, borderColor: sureName === 'Diğer' ? '#70c5bb' : '#4a7a72',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                                }}>
                                    {sureName === 'Diğer' && (
                                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#70c5bb' }} />
                                    )}
                                </View>
                                <Text style={{ color: sureName === 'Diğer' ? '#70c5bb' : '#fff', fontSize: 15 }}>Diğer</Text>
                            </TouchableOpacity>
                            {sureName === 'Diğer' && (
                                <TextInput
                                    value={customSureName}
                                    onChangeText={setCustomSureName}
                                    placeholder="Sure adını yazın..."
                                    placeholderTextColor="#4a7a72"
                                    style={{
                                        backgroundColor: '#01241e', borderRadius: 10, padding: 14,
                                        color: '#fff', fontSize: 15, marginTop: 8, marginLeft: 34,
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.15)',
                                    }}
                                />
                            )}
                        </View>
                    </View>
                )}

                {/* Toplu Dua Fields - only for 'topludua' type */}
                {selectedType === 'topludua' && (
                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Niyet / Açıklama</Text>
                        <TextInput
                            value={niyetDescription}
                            onChangeText={setNiyetDescription}
                            placeholder="Dua niyetini yazın..."
                            placeholderTextColor="#4a7a72"
                            multiline
                            numberOfLines={3}
                            style={{
                                backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                                color: '#fff', fontSize: 15, marginBottom: 14, minHeight: 80, textAlignVertical: 'top',
                                borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                            }}
                        />

                        <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Canlı Yayın URL (İsteğe bağlı)</Text>
                        <TextInput
                            value={liveStreamUrl}
                            onChangeText={setLiveStreamUrl}
                            placeholder="https://..."
                            placeholderTextColor="#4a7a72"
                            keyboardType="url"
                            autoCapitalize="none"
                            style={{
                                backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                                color: '#fff', fontSize: 15, marginBottom: 14,
                                borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                            }}
                        />

                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                            backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                        }}>
                            <Text style={{ color: '#fff', fontSize: 15, flex: 1 }}>Katılımcı isimleri gizli olsun</Text>
                            <Switch
                                value={hiddenParticipants}
                                onValueChange={setHiddenParticipants}
                                trackColor={{ false: '#4a7a72', true: '#70c5bb' }}
                                thumbColor={hiddenParticipants ? '#D4AF37' : '#a8c5bf'}
                            />
                        </View>
                    </View>
                )}

                {/* Total Parts (not for hatim) */}
                {selectedType && selectedType !== 'hatim' && (
                    <>
                        <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Toplam Parça Sayısı</Text>
                        <TextInput
                            value={totalParts}
                            onChangeText={setTotalParts}
                            placeholder="Örn: 100"
                            placeholderTextColor="#4a7a72"
                            keyboardType="numeric"
                            style={{
                                backgroundColor: '#032b23', borderRadius: 14, padding: 16,
                                color: '#fff', fontSize: 15, marginBottom: 24,
                                borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                            }}
                        />
                    </>
                )}

                {/* End Date Picker */}
                {selectedType && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>Bitiş Tarihi ve Saati</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={{ color: '#4a7a72', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Gün</Text>
                                <TextInput
                                    value={endDay}
                                    onChangeText={setEndDay}
                                    placeholder="01"
                                    placeholderTextColor="#4a7a72"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    style={{
                                        backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                                        color: '#fff', fontSize: 16, textAlign: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                                    }}
                                />
                            </View>
                            <Text style={{ color: '#4a7a72', fontSize: 20, marginTop: 14 }}>/</Text>
                            <View style={{ flex: 1, marginHorizontal: 8 }}>
                                <Text style={{ color: '#4a7a72', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Ay</Text>
                                <TextInput
                                    value={endMonth}
                                    onChangeText={setEndMonth}
                                    placeholder="01"
                                    placeholderTextColor="#4a7a72"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    style={{
                                        backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                                        color: '#fff', fontSize: 16, textAlign: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                                    }}
                                />
                            </View>
                            <Text style={{ color: '#4a7a72', fontSize: 20, marginTop: 14 }}>/</Text>
                            <View style={{ flex: 1.5, marginLeft: 8 }}>
                                <Text style={{ color: '#4a7a72', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Yıl</Text>
                                <TextInput
                                    value={endYear}
                                    onChangeText={setEndYear}
                                    placeholder="2026"
                                    placeholderTextColor="#4a7a72"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    style={{
                                        backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                                        color: '#fff', fontSize: 16, textAlign: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={{ color: '#4a7a72', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Saat</Text>
                                <TextInput
                                    value={endHour}
                                    onChangeText={setEndHour}
                                    placeholder="00"
                                    placeholderTextColor="#4a7a72"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    style={{
                                        backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                                        color: '#fff', fontSize: 16, textAlign: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                                    }}
                                />
                            </View>
                            <Text style={{ color: '#4a7a72', fontSize: 20, marginTop: 14 }}>:</Text>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={{ color: '#4a7a72', fontSize: 11, marginBottom: 4, textAlign: 'center' }}>Dakika</Text>
                                <TextInput
                                    value={endMinute}
                                    onChangeText={setEndMinute}
                                    placeholder="00"
                                    placeholderTextColor="#4a7a72"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    style={{
                                        backgroundColor: '#032b23', borderRadius: 10, padding: 12,
                                        color: '#fff', fontSize: 16, textAlign: 'center',
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Create Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={loading}
                    style={{
                        backgroundColor: '#70c5bb', paddingVertical: 18, borderRadius: 16,
                        alignItems: 'center', opacity: loading ? 0.6 : 1, marginTop: 8,
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#01241e', fontSize: 17, fontWeight: '700' }}>
                        {loading ? 'Oluşturuluyor...' : 'Zincir Oluştur'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
