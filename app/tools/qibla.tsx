import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const { width } = Dimensions.get('window');

function toRadians(deg: number) {
    return (deg * Math.PI) / 180;
}

function toDegrees(rad: number) {
    return (rad * 180) / Math.PI;
}

function calculateQiblaDirection(lat: number, lng: number): number {
    const phiK = toRadians(KAABA_LAT);
    const lambdaK = toRadians(KAABA_LNG);
    const phi = toRadians(lat);
    const lambda = toRadians(lng);
    const deltaLambda = lambdaK - lambda;

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

    let qibla = toDegrees(Math.atan2(y, x));
    if (qibla < 0) qibla += 360;
    return qibla;
}

export default function QiblaScreen() {
    const [heading, setHeading] = useState(0);
    const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState('');
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        initQibla();
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
        };
    }, []);

    const initQibla = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Konum izni gerekli. Lütfen ayarlardan izin verin.');
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude } = location.coords;

            const angle = calculateQiblaDirection(latitude, longitude);
            setQiblaAngle(angle);

            try {
                const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (address) {
                    setLocationName(`${address.district || address.subregion || ''}, ${address.city || address.region || ''}`);
                }
            } catch {
                // ignore reverse geocode errors
            }

            // Use Location.watchHeadingAsync which provides true north heading
            subscriptionRef.current = await Location.watchHeadingAsync((data) => {
                // Use trueHeading if available, otherwise magHeading (magnetic north)
                const headingVal = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
                setHeading(headingVal);
            });

            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Konum veya pusula verisi alınamadı.');
            setLoading(false);
        }
    };

    const qiblaRelative = qiblaAngle !== null ? (qiblaAngle - heading + 360) % 360 : 0;
    const isAligned = qiblaAngle !== null && (qiblaRelative < 5 || qiblaRelative > 355 || (qiblaRelative > 355 && qiblaRelative < 5));

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Stack.Screen options={{ title: 'Kıble Bulucu', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <ActivityIndicator size="large" color="#70c5bb" />
                <Text style={{ color: '#a8c5bf', marginTop: 12, fontSize: 14 }}>Kıble yönü hesaplanıyor...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                <Stack.Screen options={{ title: 'Kıble Bulucu', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <Ionicons name="warning-outline" size={48} color="#D4AF37" />
                <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16, textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e', alignItems: 'center', justifyContent: 'center' }}>
            <Stack.Screen options={{ title: 'Kıble Bulucu', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            {locationName ? (
                <Text style={{ color: '#4a7a72', fontSize: 14, marginBottom: 8 }}>
                    {locationName}
                </Text>
            ) : null}

            <Text style={{ color: '#a8c5bf', fontSize: 16, marginBottom: 4 }}>
                Kıble Yönü
            </Text>
            <Text style={{ color: '#D4AF37', fontSize: 28, fontWeight: '800', marginBottom: 30 }}>
                {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '--'}
            </Text>

            {/* Compass Circle */}
            <View style={{
                width: width * 0.7,
                height: width * 0.7,
                borderRadius: width * 0.35,
                borderWidth: 3,
                borderColor: isAligned ? '#D4AF37' : 'rgba(112,197,187,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#032b23',
                transform: [{ rotate: `${-heading}deg` }] // Rotate the compass rose itself against heading
            }}>
                {/* N/S/E/W markers - Fixed on the compass rose */}
                <Text style={{ position: 'absolute', top: 12, color: '#ef4444', fontSize: 16, fontWeight: '700', transform: [{ rotate: `${heading}deg` }] }}>K</Text>
                <Text style={{ position: 'absolute', bottom: 12, color: '#4a7a72', fontSize: 16, fontWeight: '700', transform: [{ rotate: `${heading}deg` }] }}>G</Text>
                <Text style={{ position: 'absolute', right: 12, color: '#4a7a72', fontSize: 16, fontWeight: '700', transform: [{ rotate: `${heading}deg` }] }}>D</Text>
                <Text style={{ position: 'absolute', left: 12, color: '#4a7a72', fontSize: 16, fontWeight: '700', transform: [{ rotate: `${heading}deg` }] }}>B</Text>

                {/* Qibla Arrow - Rotates to point to Qibla relative to North */}
                <View style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    transform: [{ rotate: `${qiblaAngle}deg` }]
                }}>
                    <View style={{ paddingTop: 35, alignItems: 'center' }}>
                        <Ionicons
                            name="arrow-up"
                            size={44}
                            color={isAligned ? '#D4AF37' : '#70c5bb'}
                        />
                    </View>
                </View>
            </View>

            <Text style={{
                color: isAligned ? '#D4AF37' : '#a8c5bf',
                fontSize: 16,
                fontWeight: '600',
                marginTop: 30,
                textAlign: 'center',
            }}>
                {isAligned
                    ? 'Kıble yönüne bakıyorsunuz!'
                    : 'Telefonu döndürerek kıble yönünü bulun'}
            </Text>

            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 8 }}>
                Pusula: {Math.round(heading)}° · Kıble: {Math.round(qiblaAngle || 0)}°
            </Text>
        </View>
    );
}
