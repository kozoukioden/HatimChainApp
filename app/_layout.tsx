import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#01241e' }}>
            <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../assets/icon.png')}
                    style={{
                        width: 300,
                        height: 300,
                        opacity: 0.03,
                        resizeMode: 'contain',
                        tintColor: '#fff'
                    }}
                />
            </View>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#01241e' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: 'transparent' },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="chain/create"
                    options={{
                        title: 'Zincir Oluştur',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="chain/[id]"
                    options={{
                        title: 'Zincir Detayı',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="surah/[number]"
                    options={{
                        title: 'Sure Detayı',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="profile/[id]"
                    options={{
                        title: 'Kullanıcı Profili',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/quran"
                    options={{
                        title: "Kur'an-ı Kerim",
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/discover"
                    options={{
                        title: 'Kişiler',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/qibla"
                    options={{
                        title: 'Kıble Bulucu',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/dhikr"
                    options={{
                        title: 'Zikirmatik',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/mosques"
                    options={{
                        title: 'Cami ve Teravih Haritası',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/kazatracker"
                    options={{
                        title: 'Kaza Takibi',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/calculator"
                    options={{
                        title: 'Hatim Hesaplayıcı',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/settings"
                    options={{
                        title: 'Ayarlar',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/ask-hoca"
                    options={{
                        title: 'Dini Sohbet',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/ramadan"
                    options={{
                        title: 'Ramazan Özel',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
                <Stack.Screen
                    name="tools/zekatmatik"
                    options={{
                        title: 'Zekatmatik',
                        headerStyle: { backgroundColor: '#01241e' },
                        headerTintColor: '#70c5bb',
                    }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}
