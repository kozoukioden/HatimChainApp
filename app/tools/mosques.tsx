import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function MosquesScreen() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [locationName, setLocationName] = useState('');

    useEffect(() => { getLocation(); }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Konum izni gerekli. Lütfen ayarlardan izin verin.');
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);

            try {
                const [address] = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                if (address) {
                    const district = address.district || address.subregion || '';
                    const city = address.city || address.region || '';
                    setLocationName(`${district}${district && city ? ', ' : ''}${city}`);
                }
            } catch {
                // ignore reverse geocode errors
            }

            setLoading(false);
        } catch {
            setError('Konum alınamadı. Lütfen GPS\'inizi açın.');
            setLoading(false);
        }
    };

    const openGoogleMaps = () => {
        if (latitude !== null && longitude !== null) {
            const url = `https://www.google.com/maps/search/cami/@${latitude},${longitude},15z`;
            Linking.openURL(url);
        }
    };

    const openTeravihMaps = () => {
        if (latitude !== null && longitude !== null) {
            const url = `https://www.google.com/maps/search/teravih+namaz%C4%B1+cami/@${latitude},${longitude},15z`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Stack.Screen options={{ title: 'Cami ve Teravih Haritası', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <ActivityIndicator size="large" color="#70c5bb" />
                <Text style={{ color: '#a8c5bf', marginTop: 12, fontSize: 14 }}>Konum alınıyor...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                <Stack.Screen options={{ title: 'Cami ve Teravih Haritası', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <Ionicons name="warning-outline" size={48} color="#D4AF37" />
                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>{error}</Text>
                <TouchableOpacity
                    onPress={getLocation}
                    style={{
                        marginTop: 24, paddingHorizontal: 24, paddingVertical: 12,
                        backgroundColor: '#70c5bb', borderRadius: 12,
                    }}
                >
                    <Text style={{ color: '#01241e', fontSize: 15, fontWeight: '700' }}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
            <Stack.Screen options={{ title: 'Cami ve Teravih Haritası', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            <View style={{
                width: 96, height: 96, borderRadius: 28,
                backgroundColor: 'rgba(112,197,187,0.08)',
                justifyContent: 'center', alignItems: 'center', marginBottom: 24,
            }}>
                <Ionicons name="business-outline" size={48} color="#70c5bb" />
            </View>

            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
                Cami ve Teravih Haritası
            </Text>

            {locationName ? (
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#032b23', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
                    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                }}>
                    <Ionicons name="location-outline" size={18} color="#70c5bb" />
                    <Text style={{ color: '#a8c5bf', fontSize: 14, marginLeft: 8 }}>{locationName}</Text>
                </View>
            ) : null}

            <Text style={{ color: '#4a7a72', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
                Bulunduğunuz konuma yakın camileri ve teravih namazı kılınan yerleri Google Maps üzerinden görüntüleyin.
            </Text>

            <TouchableOpacity
                onPress={openGoogleMaps}
                activeOpacity={0.7}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#70c5bb',
                    borderRadius: 16,
                    paddingHorizontal: 28,
                    paddingVertical: 16,
                    width: '100%',
                    marginBottom: 12,
                }}
            >
                <Ionicons name="map-outline" size={22} color="#01241e" />
                <Text style={{ color: '#01241e', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>
                    Yakın Camileri Göster
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={openTeravihMaps}
                activeOpacity={0.7}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(212,175,55,0.15)',
                    borderRadius: 16,
                    paddingHorizontal: 28,
                    paddingVertical: 16,
                    width: '100%',
                    borderWidth: 1,
                    borderColor: 'rgba(212,175,55,0.3)',
                }}
            >
                <Ionicons name="moon-outline" size={22} color="#D4AF37" />
                <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>
                    Teravih Namazı Yerleri
                </Text>
            </TouchableOpacity>

            {latitude !== null && longitude !== null && (
                <Text style={{ color: '#4a7a72', fontSize: 11, marginTop: 16 }}>
                    Koordinatlar: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
            )}
        </View>
    );
}
