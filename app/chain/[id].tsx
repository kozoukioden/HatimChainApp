import { View, Text, TouchableOpacity, ScrollView, Alert, Share, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChainService, Chain, ChainPart } from '../../services/chains';
import { AuthService, User } from '../../services/auth';
import { Linking } from 'react-native';
import { censorName } from '../../services/utils';

const STATUS_COLORS: Record<string, string> = {
    available: '#ef4444',
    taken: '#6b7280',
    completed: '#10b981',
};

const STATUS_LABELS: Record<string, string> = {
    available: 'Boş',
    taken: 'Alındı',
    completed: 'Bitti',
};

interface CountdownData {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

export default function ChainDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [chain, setChain] = useState<Chain | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [countdown, setCountdown] = useState<CountdownData | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(useCallback(() => { loadData(); }, [id]));

    useEffect(() => {
        if (!chain?.endDate) return;

        const updateCountdown = () => {
            try {
                const now = new Date().getTime();
                const end = new Date(chain.endDate).getTime();
                const diff = end - now;

                if (diff <= 0) {
                    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
                } else {
                    setCountdown({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((diff % (1000 * 60)) / 1000),
                        expired: false,
                    });
                }
            } catch {
                setCountdown(null);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [chain?.endDate]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setLoadError(false);
            if (!id) return;

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 15000)
            );

            const dataPromise = Promise.all([ChainService.getChainById(id), AuthService.getCurrentUser()]);
            const [c, u] = await Promise.race([dataPromise, timeoutPromise]) as [Chain | null, User | null];

            if (!c) {
                setLoadError(true);
            } else {
                setChain(c);
            }
            setUser(u);
        } catch (e) {
            console.error('Chain load error:', e);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaimPart = (part: ChainPart) => {
        if (!user) { Alert.alert('Uyarı', 'Giriş yapmanız gerekiyor.'); return; }
        if (part.status !== 'available') return;

        const label = chain?.type === 'hatim' ? `${part.number}. Cüz` : `${part.number}. Parça`;
        Alert.alert('Parça Al', `${label}'ü almak istiyor musunuz?`, [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Al', onPress: async () => {
                    await ChainService.claimPart(id!, part.number, user.id, user.fullName);
                    loadData();
                },
            },
        ]);
    };

    const handleCompletePart = (part: ChainPart) => {
        if (part.status !== 'taken' || part.takenBy !== user?.id) return;

        Alert.alert('Tamamla', 'Bu parçayı tamamladınız mı?', [
            { text: 'Hayır', style: 'cancel' },
            {
                text: 'Evet, Tamamladım', onPress: async () => {
                    await ChainService.completePart(id!, part.number);
                    loadData();
                },
            },
        ]);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `"${chain?.title}" zincirine katılmak ister misiniz?\n\nHatim Zinciri uygulamasından katılabilirsiniz.\nZincir Kodu: ${id}`,
            });
        } catch (e) { }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#70c5bb" />
                <Text style={{ color: '#a8c5bf', marginTop: 12 }}>Yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    if (loadError || !chain) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                <StatusBar style="light" />
                <Ionicons name="alert-circle-outline" size={48} color="#D4AF37" />
                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>Zincir yüklenemedi. Lütfen tekrar deneyin.</Text>
                <TouchableOpacity
                    onPress={loadData}
                    style={{ marginTop: 20, backgroundColor: '#70c5bb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                >
                    <Text style={{ color: '#01241e', fontWeight: '700', fontSize: 15 }}>Tekrar Dene</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginTop: 12 }}
                >
                    <Text style={{ color: '#4a7a72', fontSize: 14 }}>Geri Dön</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const progress = ChainService.getProgress(chain);
    const isHatim = chain.type === 'hatim';
    const isTopluDua = chain.type === 'topludua';
    const isExpired = countdown?.expired === true;

    const hideParticipantNames = isTopluDua && (chain as any).hiddenParticipants && user?.id !== chain.createdBy;

    const headerSubtitle = (chain as any).sureName
        ? `${chain.type} Zinciri - ${(chain as any).sureName}`
        : `${chain.type} Zinciri`;

    const countdownText = countdown && !countdown.expired
        ? `${countdown.days} gün ${countdown.hours} saat ${countdown.minutes} dk ${countdown.seconds} sn`
        : '';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e' }} edges={['bottom']}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                {/* Header Card */}
                <View style={{
                    backgroundColor: '#032b23', borderRadius: 20, padding: 24, marginBottom: 20,
                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.12)',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(112,197,187,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                            <Ionicons name={isHatim ? 'book' : chain.type === 'salavat' ? 'heart' : chain.type === 'sure' ? 'document-text' : 'hand-left'} size={24} color="#70c5bb" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#70c5bb', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>{headerSubtitle}</Text>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{chain.title}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowShareModal(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(112,197,187,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="share-outline" size={22} color="#70c5bb" />
                        </TouchableOpacity>
                    </View>

                    {chain.description ? (
                        <Text style={{ color: '#a8c5bf', fontSize: 14, lineHeight: 22, marginBottom: 16 }}>{chain.description}</Text>
                    ) : null}

                    {isTopluDua && (chain as any).niyetDescription ? (
                        <View style={{ backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                            <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '600', marginBottom: 4 }}>Niyet</Text>
                            <Text style={{ color: '#a8c5bf', fontSize: 14, lineHeight: 20 }}>{(chain as any).niyetDescription}</Text>
                        </View>
                    ) : null}

                    {isTopluDua && (chain as any).liveStreamUrl ? (
                        <TouchableOpacity
                            onPress={() => Linking.openURL((chain as any).liveStreamUrl)}
                            style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginBottom: 16,
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="videocam-outline" size={18} color="#70c5bb" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', flex: 1 }} numberOfLines={1}>
                                Canlı Yayın Bağlantısı
                            </Text>
                            <Ionicons name="open-outline" size={16} color="#4a7a72" />
                        </TouchableOpacity>
                    ) : null}

                    {/* Dates */}
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ flex: 1, backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginRight: 8 }}>
                            <Text style={{ color: '#4a7a72', fontSize: 11, fontWeight: '600' }}>Başlangıç</Text>
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 }}>{chain.startDate}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginLeft: 8 }}>
                            <Text style={{ color: '#4a7a72', fontSize: 11, fontWeight: '600' }}>Bitiş</Text>
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 }}>{chain.endDate}</Text>
                        </View>
                    </View>

                    {/* Countdown Timer */}
                    {countdown ? (
                        <View style={{
                            backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginBottom: 16,
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: '#4a7a72', fontSize: 11, fontWeight: '600', marginBottom: 4 }}>Kalan Süre</Text>
                            {isExpired ? (
                                <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700' }}>Süre doldu!</Text>
                            ) : (
                                <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700' }}>{countdownText}</Text>
                            )}
                        </View>
                    ) : null}

                    {isTopluDua && hideParticipantNames ? (
                        <View style={{
                            backgroundColor: '#01241e', borderRadius: 12, padding: 12, marginBottom: 16,
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '600' }}>
                                {chain.parts.filter(p => p.status !== 'available').length} kişi katıldı
                            </Text>
                        </View>
                    ) : null}

                    {/* Progress */}
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#70c5bb', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ color: '#70c5bb', fontSize: 22, fontWeight: '800' }}>%{progress.percent}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981', marginRight: 4 }} />
                                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>Tamamlanan ({progress.completed})</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6b7280', marginRight: 4 }} />
                                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>Alınan ({progress.taken})</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', marginRight: 4 }} />
                                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>Boş ({progress.available})</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Parts Grid */}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 14 }}>
                    {isHatim ? 'Cüzler' : 'Parçalar'}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {chain.parts && chain.parts.length > 0 ? chain.parts.map(part => (
                        <TouchableOpacity
                            key={part.number}
                            onPress={() => {
                                if (part.status === 'available') handleClaimPart(part);
                                // Ensure user exists before checking ID match
                                else if (part.status === 'taken' && user && part.takenBy === user.id) handleCompletePart(part);
                            }}
                            style={{
                                width: isHatim ? '18.5%' : '23%',
                                aspectRatio: 1,
                                backgroundColor: STATUS_COLORS[part.status] || '#6b7280', // Fallback color
                                borderRadius: 12, margin: isHatim ? '0.75%' : '1%',
                                justifyContent: 'center', alignItems: 'center',
                                opacity: part.status === 'available' ? 1 : 0.85,
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={{ color: '#fff', fontSize: isHatim ? 16 : 14, fontWeight: '700' }}>{part.number}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8, marginTop: 2 }}>
                                {STATUS_LABELS[part.status] || ''}
                            </Text>
                        </TouchableOpacity>
                    )) : (
                        <Text style={{ color: '#a8c5bf' }}>Parçalar yüklenemedi.</Text>
                    )}
                </View>

                {/* Parts List */}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 14 }}>Detaylar</Text>
                {chain.parts && chain.parts.map(part => {
                    let displayName = part.takenByName || 'Henüz alınmadı';
                    if (part.takenByName) {
                        if (hideParticipantNames) {
                            displayName = 'Katılımcı';
                        } else {
                            displayName = censorName(part.takenByName);
                        }
                    }

                    return (
                        <View key={part.number} style={{
                            backgroundColor: '#032b23', borderRadius: 14, padding: 14, marginBottom: 8,
                            flexDirection: 'row', alignItems: 'center',
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)',
                        }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: STATUS_COLORS[part.status] || '#6b7280',
                                justifyContent: 'center', alignItems: 'center', marginRight: 14,
                            }}>
                                <Text style={{ color: '#fff', fontWeight: '700' }}>{part.number}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                                    {isHatim ? `${part.number}. Cüz` : `${part.number}. Parça`}
                                </Text>
                                <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>
                                    {displayName}
                                </Text>
                            </View>
                            {part.status === 'available' && (
                                <TouchableOpacity
                                    onPress={() => handleClaimPart(part)}
                                    style={{ backgroundColor: '#70c5bb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ color: '#01241e', fontSize: 12, fontWeight: '700' }}>AL</Text>
                                </TouchableOpacity>
                            )}
                            {part.status === 'taken' && user && part.takenBy === user.id && (
                                <TouchableOpacity
                                    onPress={() => handleCompletePart(part)}
                                    style={{ backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>TAMAMLA</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Share Modal */}
            <Modal visible={showShareModal} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <View style={{ backgroundColor: '#032b23', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Davet Bağlantısı</Text>
                            <TouchableOpacity onPress={() => setShowShareModal(false)}>
                                <Ionicons name="close" size={24} color="#a8c5bf" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: '#a8c5bf', fontSize: 14, marginBottom: 20 }}>
                            Bu bağlantıyı paylaşarak diğer kişileri zincire davet edebilirsiniz.
                        </Text>
                        <View style={{ backgroundColor: '#01241e', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                            <Text style={{ color: '#70c5bb', fontSize: 14 }} selectable>Zincir Kodu: {id}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <TouchableOpacity onPress={handleShare} style={{ alignItems: 'center' }}>
                                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(112,197,187,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                                    <Ionicons name="share-social-outline" size={24} color="#70c5bb" />
                                </View>
                                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>Paylaş</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
