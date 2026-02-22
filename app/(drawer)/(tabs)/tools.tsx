import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TOOLS = [
    { label: "Kur'an-\u0131 Kerim", icon: 'book-outline', route: '/tools/quran' },
    { label: 'Ramazan Özel', icon: 'moon-outline', route: '/tools/ramadan' },
    { label: 'Dini Sohbet (AI)', icon: 'chatbubbles-outline', route: '/tools/ask-hoca' },
    { label: 'Zekatmatik', icon: 'calculator-outline', route: '/tools/zekatmatik' },
    { label: 'Ki\u015filer', icon: 'people-outline', route: '/tools/discover' },
    { label: 'K\u0131ble Bulucu', icon: 'compass-outline', route: '/tools/qibla' },
    { label: 'Zikirmatik', icon: 'radio-button-on-outline', route: '/tools/dhikr' },
    { label: 'Yak\u0131n Camiler', icon: 'business-outline', route: '/tools/mosques' },
    { label: 'Kaza Takibi', icon: 'calendar-outline', route: '/tools/kazatracker' },
    { label: 'Hatim Hesaplay\u0131c\u0131', icon: 'calculator-outline', route: '/tools/calculator' },
    { label: 'Ayarlar', icon: 'settings-outline', route: '/tools/settings' },
];

export default function ToolsScreen() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#01241e' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        >
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 }}>
                Araçlar
            </Text>
            <Text style={{ color: '#4a7a72', fontSize: 14, marginBottom: 24 }}>
                Tüm araçlara buradan ulaşabilirsiniz
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {TOOLS.map((tool, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(tool.route as any)}
                        activeOpacity={0.7}
                        style={{
                            width: '48%',
                            backgroundColor: '#032b23',
                            borderRadius: 18,
                            padding: 20,
                            marginBottom: 14,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(112,197,187,0.08)',
                        }}
                    >
                        <View style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            backgroundColor: 'rgba(112,197,187,0.08)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}>
                            <Ionicons name={tool.icon as any} size={28} color="#70c5bb" />
                        </View>
                        <Text style={{
                            color: '#a8c5bf',
                            fontSize: 13,
                            fontWeight: '600',
                            textAlign: 'center',
                        }}>
                            {tool.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
