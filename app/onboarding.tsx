import { View, Text, TouchableOpacity, FlatList, Dimensions, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useCallback } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        icon: 'book' as const,
        title: "HATİM ZİNCİRİ'NE\nHOŞGELDİNİZ",
        subtitle: 'Zincirler Kurulsun\nDualar Kabul Olsun',
        description: 'Hatim, Salavat, Sure ve Dua zincirleri oluşturun, toplu ibadet yapmanın bereketini yaşayın.',
    },
    {
        id: '2',
        icon: 'people' as const,
        title: 'ZİNCİR OLUŞTUR\nve KATIL',
        subtitle: 'Birlikte İbadet',
        description: 'Hatim zinciri oluşturun, 30 cüzü paylaştırın. Salavat, Sure ve Dua zincirleriyle sevap kazanın.',
    },
    {
        id: '3',
        icon: 'heart' as const,
        title: 'SEVAP KAZANIN\nve PAYLAŞIN',
        subtitle: 'Hayırlı Ameller',
        description: 'Arkadaşlarınızı davet edin, birlikte hatim indirin. Her okuduğunuz sevap defterinize yazılsın.',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('onboarding_seen', 'true');
        router.replace('/login');
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => (
        <View style={{ width, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <View style={{
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: 'rgba(112, 197, 187, 0.15)',
                justifyContent: 'center', alignItems: 'center', marginBottom: 40,
            }}>
                <Ionicons name={item.icon} size={56} color="#70c5bb" />
            </View>

            <Text style={{
                color: '#D4AF37', fontSize: 28, fontWeight: '800',
                textAlign: 'center', lineHeight: 38, marginBottom: 12,
                letterSpacing: 1,
            }}>
                {item.title}
            </Text>

            <Text style={{
                color: '#70c5bb', fontSize: 18, fontWeight: '600',
                textAlign: 'center', marginBottom: 20, fontStyle: 'italic',
            }}>
                {item.subtitle}
            </Text>

            <Text style={{
                color: '#a8c5bf', fontSize: 15, textAlign: 'center',
                lineHeight: 24, paddingHorizontal: 10,
            }}>
                {item.description}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />

            <TouchableOpacity
                onPress={finishOnboarding}
                style={{ position: 'absolute', top: 60, right: 24, zIndex: 10, padding: 8 }}
            >
                <Text style={{ color: '#a8c5bf', fontSize: 15, fontWeight: '600' }}>ATLA</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                style={{ flex: 1 }}
            />

            <View style={{ paddingHorizontal: 40, paddingBottom: 40 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={{
                                width: currentIndex === i ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: currentIndex === i ? '#70c5bb' : 'rgba(112, 197, 187, 0.3)',
                                marginHorizontal: 4,
                            }}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleNext}
                    style={{
                        backgroundColor: '#70c5bb',
                        paddingVertical: 16,
                        borderRadius: 16,
                        alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#01241e', fontSize: 17, fontWeight: '700' }}>
                        {currentIndex === slides.length - 1 ? 'BAŞLA' : 'DEVAM ET'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
