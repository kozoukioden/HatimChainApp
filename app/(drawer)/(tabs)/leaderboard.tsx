import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LeaderboardService, UserStats } from '../../../services/leaderboard';
import { AuthService } from '../../../services/auth';
import { SocialService } from '../../../services/social';
import { censorName } from '../../../services/utils';

const MEDAL_COLORS = ['#D4AF37', '#C0C0C0', '#CD7F32'];
const SEGMENTS = [
    { key: 'general', label: 'Genel' },
    { key: 'sure', label: 'Sure Okuyanlar' },
    { key: 'cuz', label: 'Cüz Okuyanlar' },
];

export default function LeaderboardScreen() {
    const [users, setUsers] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
    const [segment, setSegment] = useState('general');

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        setLoading(true);
        const [data, currentUser] = await Promise.all([
            LeaderboardService.getTopUsers(),
            AuthService.getCurrentUser(),
        ]);
        setUsers(data);
        if (currentUser) {
            setCurrentUserId(currentUser.id);
            const states: Record<string, boolean> = {};
            for (const u of data) {
                if (u.userId !== currentUser.id) {
                    states[u.userId] = await SocialService.isFollowing(currentUser.id, u.userId);
                }
            }
            setFollowStates(states);
        }
        setLoading(false);
    };

    const toggleFollow = async (userId: string) => {
        if (!currentUserId) return;
        const isFollowing = followStates[userId];
        if (isFollowing) {
            await SocialService.unfollowUser(currentUserId, userId);
        } else {
            await SocialService.followUser(currentUserId, userId);
        }
        setFollowStates(prev => ({ ...prev, [userId]: !isFollowing }));
    };

    const getSortedUsers = () => {
        const sorted = [...users];
        if (segment === 'sure') {
            sorted.sort((a, b) => b.suresCompleted - a.suresCompleted);
        } else if (segment === 'cuz') {
            sorted.sort((a, b) => b.cuzCompleted - a.cuzCompleted);
        }
        return sorted;
    };

    const getScoreForSegment = (item: UserStats) => {
        if (segment === 'sure') return item.suresCompleted;
        if (segment === 'cuz') return item.cuzCompleted;
        return item.totalScore;
    };

    const getScoreLabel = () => {
        if (segment === 'sure') return 'sure';
        if (segment === 'cuz') return 'cüz';
        return 'puan';
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#70c5bb" />
            </View>
        );
    }

    const sortedUsers = getSortedUsers();

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            {/* Segment Control */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
                {SEGMENTS.map(s => (
                    <TouchableOpacity
                        key={s.key}
                        onPress={() => setSegment(s.key)}
                        style={{
                            flex: 1, paddingVertical: 10, borderRadius: 10, marginHorizontal: 3,
                            backgroundColor: segment === s.key ? '#70c5bb' : '#032b23',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: segment === s.key ? '#70c5bb' : 'rgba(112,197,187,0.1)',
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={{
                            color: segment === s.key ? '#01241e' : '#a8c5bf',
                            fontSize: 12, fontWeight: '700',
                        }}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sortedUsers.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Ionicons name="trophy-outline" size={64} color="#4a7a72" />
                    <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                        Henüz sıralama oluşturulmadı.{'\n'}Zincirlere katılarak sevap kazanın!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedUsers}
                    keyExtractor={item => item.userId}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 4 }}
                    ListHeaderComponent={
                        sortedUsers.length >= 3 ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 28, paddingTop: 12 }}>
                                {/* 2nd Place */}
                                <TouchableOpacity onPress={() => router.push(`/profile/${sortedUsers[1].userId}`)} style={{ alignItems: 'center', flex: 1 }}>
                                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#032b23', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: MEDAL_COLORS[1], marginBottom: 8 }}>
                                        <Text style={{ color: MEDAL_COLORS[1], fontSize: 22, fontWeight: '800' }}>{sortedUsers[1].fullName[0]}</Text>
                                    </View>
                                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{censorName(sortedUsers[1].fullName)}</Text>
                                    <Text style={{ color: '#70c5bb', fontSize: 12, fontWeight: '700', marginTop: 2 }}>{getScoreForSegment(sortedUsers[1])} {getScoreLabel()}</Text>
                                    <View style={{ backgroundColor: '#032b23', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 }}>
                                        <Text style={{ color: MEDAL_COLORS[1], fontSize: 16, fontWeight: '800' }}>2</Text>
                                    </View>
                                </TouchableOpacity>
                                {/* 1st Place */}
                                <TouchableOpacity onPress={() => router.push(`/profile/${sortedUsers[0].userId}`)} style={{ alignItems: 'center', flex: 1, marginBottom: 16 }}>
                                    <Ionicons name="trophy" size={28} color="#D4AF37" style={{ marginBottom: 8 }} />
                                    <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: '#032b23', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: MEDAL_COLORS[0], marginBottom: 8 }}>
                                        <Text style={{ color: MEDAL_COLORS[0], fontSize: 26, fontWeight: '800' }}>{sortedUsers[0].fullName[0]}</Text>
                                    </View>
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>{censorName(sortedUsers[0].fullName)}</Text>
                                    <Text style={{ color: '#D4AF37', fontSize: 13, fontWeight: '700', marginTop: 2 }}>{getScoreForSegment(sortedUsers[0])} {getScoreLabel()}</Text>
                                    <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 }}>
                                        <Text style={{ color: MEDAL_COLORS[0], fontSize: 18, fontWeight: '800' }}>1</Text>
                                    </View>
                                </TouchableOpacity>
                                {/* 3rd Place */}
                                <TouchableOpacity onPress={() => router.push(`/profile/${sortedUsers[2].userId}`)} style={{ alignItems: 'center', flex: 1 }}>
                                    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#032b23', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: MEDAL_COLORS[2], marginBottom: 8 }}>
                                        <Text style={{ color: MEDAL_COLORS[2], fontSize: 20, fontWeight: '800' }}>{sortedUsers[2].fullName[0]}</Text>
                                    </View>
                                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{censorName(sortedUsers[2].fullName)}</Text>
                                    <Text style={{ color: '#70c5bb', fontSize: 12, fontWeight: '700', marginTop: 2 }}>{getScoreForSegment(sortedUsers[2])} {getScoreLabel()}</Text>
                                    <View style={{ backgroundColor: '#032b23', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 }}>
                                        <Text style={{ color: MEDAL_COLORS[2], fontSize: 16, fontWeight: '800' }}>3</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    renderItem={({ item, index }) => {
                        if (index < 3 && sortedUsers.length >= 3) return null;
                        const isMe = item.userId === currentUserId;
                        const isFollowing = followStates[item.userId];
                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`/profile/${item.userId}`)}
                                style={{
                                    backgroundColor: '#032b23', borderRadius: 14, padding: 16, marginBottom: 8,
                                    flexDirection: 'row', alignItems: 'center',
                                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#4a7a72', fontSize: 16, fontWeight: '700', width: 32, textAlign: 'center' }}>{index + 1}</Text>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0a3d32', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <Text style={{ color: '#70c5bb', fontSize: 16, fontWeight: '700' }}>{item.fullName[0]}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{censorName(item.fullName)}</Text>
                                    <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>
                                        {item.partsCompleted} tamamlanan · {item.chainsJoined} zincir
                                    </Text>
                                </View>
                                <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '700', marginRight: 8 }}>{getScoreForSegment(item)}</Text>
                                {!isMe && (
                                    <TouchableOpacity
                                        onPress={(e) => { e.stopPropagation(); toggleFollow(item.userId); }}
                                        style={{
                                            width: 32, height: 32, borderRadius: 16,
                                            backgroundColor: isFollowing ? 'rgba(112,197,187,0.1)' : '#70c5bb',
                                            justifyContent: 'center', alignItems: 'center',
                                        }}
                                    >
                                        <Ionicons name={isFollowing ? 'checkmark' : 'person-add-outline'} size={16} color={isFollowing ? '#70c5bb' : '#01241e'} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}
