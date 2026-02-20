import { View, Text, ScrollView, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthService, User } from '../../../services/auth';
import { SocialService } from '../../../services/social';
import { LeaderboardService, UserStats } from '../../../services/leaderboard';
import { ChainService, Chain } from '../../../services/chains';
import { censorName } from '../../../services/utils';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
    const [createdChains, setCreatedChains] = useState<Chain[]>([]);
    const [activeChains, setActiveChains] = useState<Chain[]>([]);
    const [completedChains, setCompletedChains] = useState<Chain[]>([]);

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        const u = await AuthService.getCurrentUser();
        setUser(u);
        if (u) {
            const [s, fc, allChains] = await Promise.all([
                LeaderboardService.getUserStats(u.id),
                SocialService.getFollowCounts(u.id),
                ChainService.getAllChains(),
            ]);
            setStats(s);
            setFollowCounts(fc);
            setCreatedChains(allChains.filter(c => c.createdBy === u.id));
            setActiveChains(allChains.filter(c => c.parts.some(p => p.takenBy === u.id && p.status === 'taken')));
            setCompletedChains(allChains.filter(c => c.parts.some(p => p.takenBy === u.id && p.status === 'completed')));
        }
    };

    const handleShare = async () => {
        if (!user) return;
        const code = SocialService.generateProfileCode(user.id);
        try {
            await Share.share({
                message: `Hatim Zinciri'nde beni takip edin!\nProfil Kodum: ${code}\nAd: ${user.fullName}`,
            });
        } catch { }
    };

    const handleLogout = () => {
        Alert.alert('Çıkış', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await AuthService.logout(); router.replace('/login'); } },
        ]);
    };

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#a8c5bf' }}>Yükleniyor...</Text>
            </View>
        );
    }

    const initials = user.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Avatar + Name */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={{
                        width: 80, height: 80, borderRadius: 40, backgroundColor: '#0a3d32',
                        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
                        borderWidth: 3, borderColor: '#70c5bb',
                    }}>
                        <Text style={{ color: '#70c5bb', fontSize: 28, fontWeight: '800' }}>{initials}</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{user.fullName}</Text>
                    <Text style={{ color: '#4a7a72', fontSize: 13, marginTop: 4 }}>{user.email}</Text>
                    <TouchableOpacity onPress={handleShare} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(112,197,187,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                        <Ionicons name="share-social-outline" size={16} color="#70c5bb" />
                        <Text style={{ color: '#70c5bb', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>Profili Paylaş</Text>
                    </TouchableOpacity>
                </View>

                {/* Follow Counts */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
                    <View style={{ alignItems: 'center', marginHorizontal: 24 }}>
                        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{followCounts.followers}</Text>
                        <Text style={{ color: '#4a7a72', fontSize: 12 }}>Takipçi</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(112,197,187,0.1)' }} />
                    <View style={{ alignItems: 'center', marginHorizontal: 24 }}>
                        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{followCounts.following}</Text>
                        <Text style={{ color: '#4a7a72', fontSize: 12 }}>Takip</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                    {[
                        { label: 'Oluşturulan', value: stats?.chainsCreated || 0, icon: 'add-circle-outline' },
                        { label: 'Katılınan', value: stats?.chainsJoined || 0, icon: 'people-outline' },
                        { label: 'Tamamlanan', value: stats?.partsCompleted || 0, icon: 'checkmark-circle-outline' },
                        { label: 'Toplam Puan', value: stats?.totalScore || 0, icon: 'trophy-outline' },
                    ].map((stat, i) => (
                        <View key={i} style={{
                            width: '48%', backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 10,
                            marginRight: i % 2 === 0 ? '4%' : 0,
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                        }}>
                            <Ionicons name={stat.icon as any} size={22} color="#70c5bb" />
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 8 }}>{stat.value}</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Created Chains */}
                {createdChains.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Oluşturduğu Zincirler</Text>
                        {createdChains.slice(0, 5).map(chain => {
                            const pr = ChainService.getProgress(chain);
                            return (
                                <TouchableOpacity key={chain.id} onPress={() => router.push(`/chain/${chain.id}`)} style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)' }} activeOpacity={0.7}>
                                    <Ionicons name="link-outline" size={20} color="#70c5bb" style={{ marginRight: 12 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{chain.title}</Text>
                                        <Text style={{ color: '#4a7a72', fontSize: 11, marginTop: 2 }}>{chain.type} · %{pr.percent}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Active Readings */}
                {activeChains.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Aktif Okumaları</Text>
                        {activeChains.slice(0, 5).map(chain => (
                            <TouchableOpacity key={chain.id} onPress={() => router.push(`/chain/${chain.id}`)} style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)' }} activeOpacity={0.7}>
                                <Ionicons name="book-outline" size={20} color="#D4AF37" style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{chain.title}</Text>
                                    <Text style={{ color: '#4a7a72', fontSize: 11, marginTop: 2 }}>{chain.type}</Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                    <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>Devam Ediyor</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Completed */}
                {completedChains.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Tamamlananlar</Text>
                        {completedChains.slice(0, 5).map(chain => (
                            <TouchableOpacity key={chain.id} onPress={() => router.push(`/chain/${chain.id}`)} style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)' }} activeOpacity={0.7}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{chain.title}</Text>
                                    <Text style={{ color: '#4a7a72', fontSize: 11, marginTop: 2 }}>{chain.type}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Menu Items */}
                <View style={{ marginTop: 8 }}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.shopier.com/hmsoftwarestudio#Ba%C4%9F%C4%B1%C5%9F')}
                        style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)' }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="heart-outline" size={22} color="#D4AF37" />
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 14, flex: 1 }}>Bağış / Destek</Text>
                        <Ionicons name="chevron-forward" size={18} color="#4a7a72" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/tools/settings')}
                        style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(112,197,187,0.06)' }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={22} color="#70c5bb" />
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 14, flex: 1 }}>Ayarlar</Text>
                        <Ionicons name="chevron-forward" size={18} color="#4a7a72" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        style={{ backgroundColor: '#032b23', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)' }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600', marginLeft: 14, flex: 1 }}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner Ad */}
                <View style={{ marginTop: 16, alignItems: 'center' }}>
                    <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </ScrollView>
        </View>
    );
}
