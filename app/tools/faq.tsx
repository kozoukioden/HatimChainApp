import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function FAQScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <Stack.Screen options={{ title: 'Rehber ve SSS', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) + 40 }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🕋 Hatim Zinciri Kullanım Rehberi ve Özellikler</Text>

                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>Uygulamamız, ibadetlerinizi dijital dünyada toplu bir ruhla eda edebilmeniz için tasarlandı. İşte uygulamamızın her bir köşesi ve sunduğu imkanlar:</Text>

                <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 8 }}>1. Hatim Zinciri Sistemi (Ana Özellik)</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 8 }}>Uygulamanın kalbi burasıdır. Tek başınıza aylar sürecek bir Kur'an hatmini, onlarca kişiyle saatler içinde tamamlayabilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Zincir Oluşturma:</Text> Kendi niyetinizle bir hatim başlatabilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cüz/Sayı Seçimi:</Text> İster Kur'an cüzü, ister belirli sayıda Salavat veya Esmaül Hüsna olsun; kapasitenize göre seçim yapabilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Takip Sistemi:</Text> Aldığınız görevi bitirdiğinizde "Okundu" olarak işaretlersiniz. Tüm cüzler bittiğinde sistem otomatik olarak "Hatim Tamamlandı" bilgisini herkese geçer.</Text>

                <Text style={{ color: '#70c5bb', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 8 }}>2. Ramazan-ı Şerif Alanı</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 8 }}>Ramazan ayının ruhuna uygun, her an elinizin altında olması gereken araçlar:</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>İmsakiye:</Text> Bulunduğunuz konuma göre iftar ve sahur vakitlerini anlık takip edebilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Geri Sayım:</Text> "İftara ne kadar kaldı?" sorusunun cevabını saniyelik olarak görebilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ramazan Duaları:</Text> Her güne özel dualar ve hatırlatmalarla manevi atmosferi koruyabilirsiniz.</Text>

                <Text style={{ color: '#70c5bb', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 8 }}>3. Kıble Pusulası (Kıble Bulucu)</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hassas Tespit:</Text> Telefonunuzun pusula sensörünü kullanarak Kabe'nin yönünü tam doğrulukla gösterir.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Görsel Rehber:</Text> Harita destekli arayüz sayesinde çevrenizdeki binalara göre yönünüzü tayin edebilirsiniz.</Text>

                <Text style={{ color: '#70c5bb', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 8 }}>4. Kur'an-ı Kerim Modülü</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Dijital Mushaf:</Text> İstediğiniz sureye anında ulaşabilir, kaldığınız yeri işaretleyebilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cüz Takibi:</Text> Hatim zincirinden aldığınız cüzü doğrudan uygulama içinden okuyabilmeniz için optimize edilmiştir.</Text>

                <Text style={{ color: '#70c5bb', fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 8 }}>5. Diğer Manevi Araçlar (Tools)</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Zikirmatik:</Text> Tesbihatlarınızı yaparken telefonunuzu bir zikirmatik gibi kullanabilirsiniz.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 4 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kaza Takipçisi:</Text> Kaza namazları ve oruçlarını takip etme imkanı.</Text>
                <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>• <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cami Bulucu:</Text> Harita üzerinden size en yakın camileri listeler.</Text>

                <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', marginVertical: 20 }}>
                    <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>⚠️ Önemli Kullanıcı Notu</Text>
                    <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22, marginBottom: 8 }}>Değerli Kullanıcımız,</Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 15, lineHeight: 22, marginBottom: 8 }}>Hatim Zinciri uygulamamız şu an v1.1.0 aşamasındadır. Sizlere en iyi deneyimi sunmak için gece gündüz çalışsak da, bu erken aşamada bazı teknik aksaklıklar, görsel kaymalar veya küçük hatalar (bug) ile karşılaşabilirsiniz.</Text>
                    <Text style={{ color: '#D4AF37', fontSize: 15, fontStyle: 'italic', lineHeight: 22 }}>"Sabır, kurtuluşun anahtarıdır." Anlayışınız için teşekkür ederiz. Karşılaştığınız her türlü sorun ilerleyen sürümlerde titizlikle düzeltilecektir.</Text>
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>🐛 Hata mı Buldunuz? Bize Bildirin!</Text>
                    <Text style={{ color: '#a8c5bf', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>Uygulamamızı birlikte geliştirelim. Eğer bir hata ile karşılaştıysanız veya bir öneriniz varsa iletebilirsiniz.</Text>

                    <TouchableOpacity
                        style={{ backgroundColor: '#e74c3c', padding: 15, paddingHorizontal: 30, borderRadius: 12, alignItems: 'center', flexDirection: 'row' }}
                        onPress={() => Linking.openURL('mailto:hmsoftwarestudio@gmail.com?subject=Bug Bildirimi')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="flag" size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>HATA / BUG BİLDİR</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}
