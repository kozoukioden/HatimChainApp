import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth';

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [destination, setDestination] = useState<string>('');

    useEffect(() => {
        checkState();
    }, []);

    const checkState = async () => {
        try {
            const onboardingSeen = await AsyncStorage.getItem('onboarding_seen');
            if (!onboardingSeen) {
                setDestination('/onboarding');
                setLoading(false);
                return;
            }

            const user = await AuthService.getCurrentUser();
            if (!user) {
                setDestination('/login');
                setLoading(false);
                return;
            }

            setDestination('/(tabs)');
        } catch (e) {
            setDestination('/onboarding');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#01241e' }}>
                <ActivityIndicator size="large" color="#70c5bb" />
            </View>
        );
    }

    return <Redirect href={destination as any} />;
}
