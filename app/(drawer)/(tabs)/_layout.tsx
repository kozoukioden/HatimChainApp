import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Platform } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function TabsLayout() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={({ navigation }) => ({
                tabBarStyle: {
                    backgroundColor: '#01241e',
                    borderTopColor: 'rgba(112,197,187,0.1)',
                    borderTopWidth: 1,
                    height: 60 + Math.max(insets.bottom, 0),
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 4,
                },
                tabBarActiveTintColor: '#70c5bb',
                tabBarInactiveTintColor: '#4a7a72',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                headerStyle: { backgroundColor: '#01241e' },
                headerTintColor: '#70c5bb',
                headerTitleStyle: { color: '#fff', fontWeight: '700' },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 16 }}>
                        <Ionicons name="menu" size={28} color="#70c5bb" />
                    </TouchableOpacity>
                ),
            })}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ana Sayfa',
                    headerTitle: 'Hatim Zinciri',
                    tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chains"
                options={{
                    title: 'Zincirler',
                    tabBarIcon: ({ color, size }) => <Ionicons name="link-outline" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tools"
                options={{
                    title: 'Araçlar',
                    tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Enler',
                    tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
                }}
            />
        </Tabs >
    );
}
