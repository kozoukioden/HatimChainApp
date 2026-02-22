import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthService, User } from '../../services/auth';
import { SocialService } from '../../services/social';
import { FirestoreREST } from '../../services/firestore-rest';

export default function UserSearchScreen() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<User[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            // First check if it's a profile code
            const parsedId = SocialService.parseProfileCode(query.trim());
            if (parsedId) {
                const user = await AuthService.getUserData(parsedId);
                if (user) {
                    setResults([user]);
                }
            } else {
                // Otherwise, search by exact or partial name among a limited list of users
                // Note: In a production app with millions of users, this requires Algolia or ElasticSearch.
                // For Hatim Chain v1, we fetch recent users and filter locally for simplicity.
                const allUsersDocs = await FirestoreREST.listDocs('users', 300);
                const allUsers = allUsersDocs.map(d => d.data as User);

                const matches = allUsers.filter(u =>
                    u.fullName?.toLowerCase().includes(query.trim().toLowerCase()) ||
                    u.email?.toLowerCase().includes(query.trim().toLowerCase())
                );

                setResults(matches);
            }
        } catch (e) {
            Alert.alert('Hata', 'Arama sırasında bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToProfile = (userId: string) => {
        router.push(`/profile/${userId}`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <Stack.Screen options={{ title: 'Kullanıcı Ara', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />

            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#032b23', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(112,197,187,0.2)', paddingHorizontal: 12 }}>
                    <Ionicons name="search" size={20} color="#70c5bb" />
                    <TextInput
                        style={{ flex: 1, padding: 12, color: '#fff', fontSize: 16 }}
                        placeholder="İsim, e-posta veya HC-Kodu"
                        placeholderTextColor="#4a7a72"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: '#70c5bb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                            <Text style={{ color: '#01241e', fontWeight: 'bold' }}>Ara</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                    Arkadaşlarınızı bulmak için onların profil kodunu (örn: HC-abc...) girebilirsiniz.
                </Text>

                {loading ? (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#70c5bb" />
                        <Text style={{ color: '#a8c5bf', marginTop: 12 }}>Aranıyor...</Text>
                    </View>
                ) : (
                    <ScrollView style={{ marginTop: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
                        {searched && results.length === 0 && (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Ionicons name="person-outline" size={48} color="#4a7a72" />
                                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 12 }}>Kullanıcı bulunamadı.</Text>
                            </View>
                        )}

                        {results.map((user) => {
                            const initials = user.fullName ? user.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';

                            return (
                                <TouchableOpacity
                                    key={user.id}
                                    onPress={() => navigateToProfile(user.id)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', backgroundColor: '#032b23',
                                        padding: 16, borderRadius: 12, marginBottom: 12,
                                        borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)'
                                    }}
                                >
                                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#0a3d32', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                                        <Text style={{ color: '#70c5bb', fontWeight: 'bold', fontSize: 18 }}>{initials}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{user.fullName}</Text>
                                        <Text style={{ color: '#a8c5bf', fontSize: 12, marginTop: 2 }}>{SocialService.generateProfileCode(user.id)}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#4a7a72" />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}
