import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Image, Text, Linking } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';

function CustomDrawerContent(props: any) {
    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            {/* Draw Header / Logo Area */}
            <View style={{ padding: 20, paddingTop: 50, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(112,197,187,0.1)' }}>
                <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#032b23', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="book" size={40} color="#70c5bb" />
                </View>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Hatim Zinciri</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 12 }}>Paylaşarak Çoğalan Sevap</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
                <DrawerItemList {...props} />

                {/* Custom Links for Revision 1 (Side Menu same as Bottom + Extras) */}
                {/* These mimic the tabs, but since they are in tabs, we navigate to tabs */}

                <DrawerItem
                    label="Yeni Zincir Oluştur"
                    icon={({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />}
                    onPress={() => router.push('/chain/create')}
                    labelStyle={{ color: '#a8c5bf' }}
                    activeTintColor="#70c5bb"
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Cami Haritası"
                    icon={({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />}
                    onPress={() => router.push('/tools/mosques')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Zekatmatik"
                    icon={({ color, size }) => <Ionicons name="calculator-outline" size={size} color={color} />}
                    onPress={() => router.push('/tools/zekatmatik')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Kaza Takibi"
                    icon={({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />}
                    onPress={() => router.push('/tools/kazatracker')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Ayarlar"
                    icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
                    onPress={() => router.push('/tools/settings')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Rehber ve SSS"
                    icon={({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />}
                    onPress={() => router.push('/tools/faq')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

                <DrawerItem
                    label="Bize Ulaşın"
                    icon={({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} />}
                    onPress={() => Linking.openURL('mailto:destek@hatimchain.com?subject=Destek/Öneri')}
                    labelStyle={{ color: '#a8c5bf' }}
                    inactiveTintColor="#a8c5bf"
                />

            </DrawerContentScrollView>

            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(112,197,187,0.1)' }}>
                <Text style={{ color: '#4a7a72', fontSize: 12, textAlign: 'center' }}>v1.0.2</Text>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerStyle: { backgroundColor: '#01241e' },
                    headerTintColor: '#70c5bb',
                    drawerStyle: { backgroundColor: '#01241e', width: 280 },
                    drawerActiveTintColor: '#70c5bb',
                    drawerInactiveTintColor: '#a8c5bf',
                    headerShown: false, // Hide Drawer header because Tabs have their own
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerLabel: 'Ana Sayfa',
                        drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                        title: 'Hatim Zinciri',
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
