import { View, Text, TouchableOpacity, ScrollView, Share, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthService, User } from '../../services/auth';
import { LeaderboardService, UserStats } from '../../services/leaderboard';
import { SocialService } from '../../services/social';
import { ChainService, Chain } from '../../services/chains';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userChains, setUserChains] = useState<Chain[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMe, setIsMe] = useState(false);

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);

        const [allUsers, currentUser, s, fc, allChains] = await Promise.all([
            AuthService.getAllUsers(),
            AuthService.getCurrentUser(),
            LeaderboardService.getUserStats(id),
            SocialService.getFollowCounts(id),
            ChainService.getAllChains(),
        ]);

        const foundUser = allUsers.find(u => u.id === id);
        setProfileUser(foundUser || null);
        setStats(s);
        setFollowCounts(fc);
        setUserChains(allChains.filter(c => c.participants.includes(id)).slice(0, 10));

        if (currentUser) {
            setCurrentUserId(currentUser.id);
            setIsMe(currentUser.id === id);
            if (currentUser.id !== id) {
                const following = await SocialService.isFollowing(currentUser.id, id);
                setIsFollowing(following);
            }
        }

        setLoading(false);
    };

    const toggleFollow = async () => {
        if (!currentUserId || !id) return;
        if (isFollowing) {
            await SocialService.unfollowUser(currentUserId, id);
            setIsFollowing(false);
            setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
        } else {
            await SocialService.followUser(currentUserId, id);
            setIsFollowing(true);
            setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
        }
    };

    const handleShare = async () => {
        if (!id) return;
        const code = SocialService.generateProfileCode(id);
        await Share.share({
            message: `Hatim Zinciri'de bu profili incele!\n\nProfil Kodu: ${code}`,
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#70c5bb" />
            </View>
        );
    }

    if (!profileUser) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <Ionicons name="person-outline" size={64} color="#4a7a72" />
                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16 }}>Kullanıcı bulunamadı.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Profile Header */}
                <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#0a3d32', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#70c5bb' }}>
                        <Text style={{ color: '#70c5bb', fontSize: 32, fontWeight: '800' }}>{profileUser.fullName[0].toUpperCase()}</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{profileUser.fullName}</Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 14, marginTop: 4 }}>{profileUser.email}</Text>
                </View>

                {/* Followers / Following */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 24 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{followCounts.followers}</Text>
                        <Text style={{ color: '#a8c5bf', fontSize: 12, fontWeight: '600', marginTop: 2 }}>Takipçi</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(112,197,187,0.15)' }} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{followCounts.following}</Text>
                        <Text style={{ color: '#a8c5bf', fontSize: 12, fontWeight: '600', marginTop: 2 }}>Takip</Text>
                    </View>
                </View>

                {/* Follow + Share Buttons */}
                {!isMe && (
                    <View style={{ flexDirection: 'row', marginBottom: 24, gap: 10 }}>
                        <TouchableOpacity onPress={toggleFollow} style={{
                            flex: 1, paddingVertical: 14, borderRadius: 14,
                            backgroundColor: isFollowing ? 'rgba(112,197,187,0.1)' : '#70c5bb',
                            alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
                            borderWidth: 1, borderColor: isFollowing ? 'rgba(112,197,187,0.2)' : '#70c5bb',
                        }} activeOpacity={0.7}>
                            <Ionicons name={isFollowing ? 'checkmark' : 'person-add-outline'} size={18} color={isFollowing ? '#70c5bb' : '#01241e'} />
                            <Text style={{ color: isFollowing ? '#70c5bb' : '#01241e', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                                {isFollowing ? 'Takipte' : 'Takip Et'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={{
                            paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14,
                            backgroundColor: 'rgba(112,197,187,0.1)', alignItems: 'center',
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.2)',
                        }} activeOpacity={0.7}>
                            <Ionicons name="share-social-outline" size={18} color="#70c5bb" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Stats */}
                <View style={{ flexDirection: 'row', marginBottom: 28 }}>
                    {[
                        { label: 'Oluşturulan', value: stats?.chainsCreated || 0, icon: 'add-circle-outline' },
                        { label: 'Katılınan', value: stats?.chainsJoined || 0, icon: 'people-outline' },
                        { label: 'Tamamlanan', value: stats?.partsCompleted || 0, icon: 'checkmark-circle-outline' },
                    ].map((s, i) => (
                        <View key={i} style={{ flex: 1, backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)' }}>
                            <Ionicons name={s.icon as any} size={24} color="#70c5bb" />
                            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 }}>{s.value}</Text>
                            <Text style={{ color: '#a8c5bf', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Total Score */}
                <View style={{ backgroundColor: '#0a3d32', borderRadius: 16, padding: 18, marginBottom: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' }}>
                    <Ionicons name="star" size={24} color="#D4AF37" />
                    <View style={{ marginLeft: 14, flex: 1 }}>
                        <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600' }}>TOPLAM PUAN</Text>
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{stats?.totalScore || 0}</Text>
                    </View>
                </View>

                {/* User Chains */}
                {userChains.length > 0 && (
                    <View>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 14 }}>Katıldığı Zincirler</Text>
                        {userChains.map(chain => {
                            const pr = ChainService.getProgress(chain);
                            return (
                                <View key={chain.id} style={{
                                    backgroundColor: '#032b23', borderRadius: 14, padding: 16, marginBottom: 8,
                                    flexDirection: 'row', alignItems: 'center',
                                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                                }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(112,197,187,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                        <Ionicons name={chain.type === 'hatim' ? 'book' : chain.type === 'salavat' ? 'heart' : chain.type === 'sure' ? 'document-text' : 'hand-left'} size={20} color="#70c5bb" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{chain.title}</Text>
                                        <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>{chain.type} · %{pr.percent}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
