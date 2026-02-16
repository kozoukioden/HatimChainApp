import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthService, User } from '../../services/auth';
import { SocialService } from '../../services/social';
import { LeaderboardService, UserStats } from '../../services/leaderboard';
import { censorName } from '../../services/utils';

interface UserWithSocial extends User {
    isFollowing: boolean;
    stats: UserStats | null;
}

export default function DiscoverToolScreen() {
    const [users, setUsers] = useState<UserWithSocial[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithSocial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const loadData = async () => {
        setLoading(true);
        const [currentUser, allUsers, allStats] = await Promise.all([
            AuthService.getCurrentUser(),
            AuthService.getAllUsers(),
            LeaderboardService.getTopUsers(),
        ]);

        setCurrentUserId(currentUser?.id || null);

        const usersWithSocial: UserWithSocial[] = [];
        for (const u of allUsers) {
            if (currentUser && u.id === currentUser.id) continue;
            const isFollowing = currentUser ? await SocialService.isFollowing(currentUser.id, u.id) : false;
            const stats = allStats.find(s => s.userId === u.id) || null;
            usersWithSocial.push({ ...u, isFollowing, stats });
        }

        setUsers(usersWithSocial);
        setFilteredUsers(usersWithSocial);
        setLoading(false);
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (!text.trim()) {
            setFilteredUsers(users);
        } else {
            const q = text.toLowerCase();
            setFilteredUsers(users.filter(u => u.fullName.toLowerCase().includes(q)));
        }
    };

    const toggleFollow = async (userId: string) => {
        if (!currentUserId) return;
        const userIdx = users.findIndex(u => u.id === userId);
        if (userIdx === -1) return;

        const isFollowing = users[userIdx].isFollowing;
        if (isFollowing) {
            await SocialService.unfollowUser(currentUserId, userId);
        } else {
            await SocialService.followUser(currentUserId, userId);
        }

        const updated = users.map(u => u.id === userId ? { ...u, isFollowing: !isFollowing } : u);
        setUsers(updated);
        if (!search.trim()) {
            setFilteredUsers(updated);
        } else {
            const q = search.toLowerCase();
            setFilteredUsers(updated.filter(u => u.fullName.toLowerCase().includes(q)));
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Stack.Screen options={{ title: 'Kişiler', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <ActivityIndicator size="large" color="#70c5bb" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <Stack.Screen options={{ title: 'Kişiler', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            {/* Search */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#032b23', borderRadius: 14, paddingHorizontal: 14,
                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                }}>
                    <Ionicons name="search" size={18} color="#4a7a72" />
                    <TextInput
                        value={search}
                        onChangeText={handleSearch}
                        placeholder="Kişi ara..."
                        placeholderTextColor="#4a7a72"
                        style={{ flex: 1, color: '#fff', paddingVertical: 12, paddingLeft: 10, fontSize: 15 }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#4a7a72" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/profile/${item.id}`)}
                        style={{
                            backgroundColor: '#032b23', borderRadius: 16, padding: 16, marginBottom: 10,
                            flexDirection: 'row', alignItems: 'center',
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={{
                            width: 48, height: 48, borderRadius: 24,
                            backgroundColor: '#0a3d32', justifyContent: 'center', alignItems: 'center',
                            marginRight: 14, borderWidth: 1.5, borderColor: '#70c5bb',
                        }}>
                            <Text style={{ color: '#70c5bb', fontSize: 20, fontWeight: '800' }}>
                                {item.fullName[0].toUpperCase()}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{censorName(item.fullName)}</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>
                                {item.stats ? `${item.stats.partsCompleted} tamamlanan · ${item.stats.chainsJoined} zincir` : 'Yeni üye'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); toggleFollow(item.id); }}
                            style={{
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                                backgroundColor: item.isFollowing ? 'rgba(112,197,187,0.1)' : '#70c5bb',
                                borderWidth: 1,
                                borderColor: item.isFollowing ? 'rgba(112,197,187,0.2)' : '#70c5bb',
                            }}
                        >
                            <Text style={{
                                color: item.isFollowing ? '#70c5bb' : '#01241e',
                                fontSize: 13, fontWeight: '700',
                            }}>
                                {item.isFollowing ? 'Takipte' : 'Takip Et'}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Ionicons name="people-outline" size={48} color="#4a7a72" />
                        <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                            Henüz başka kullanıcı yok.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
