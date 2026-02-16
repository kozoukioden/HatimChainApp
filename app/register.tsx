import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { router } from 'expo-router';
import { AuthService } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName.trim()) {
            Alert.alert('Uyarı', 'Lütfen ad soyad giriniz.');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Uyarı', 'Lütfen e-posta giriniz.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Uyarı', 'Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);
        const result = await AuthService.register(email.trim(), password, fullName.trim());
        setLoading(false);

        if (result.success) {
            Alert.alert('Başarılı', `Hoş geldiniz, ${result.user?.fullName}!`, [
                { text: 'Tamam', onPress: () => router.replace('/(tabs)') },
            ]);
        } else {
            Alert.alert('Hata', result.error || 'Kayıt başarısız.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 36 }}>
                        <Text style={{ color: '#D4AF37', fontSize: 26, fontWeight: '800', letterSpacing: 2 }}>
                            KAYIT OL
                        </Text>
                        <Text style={{ color: '#a8c5bf', fontSize: 14, marginTop: 6 }}>
                            Yeni bir hesap oluşturun
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={{
                        backgroundColor: '#032b23', borderRadius: 20,
                        padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}>
                        {/* Full Name */}
                        <View style={{ marginBottom: 18 }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                                Ad Soyad
                            </Text>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#01241e', borderRadius: 14,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                                paddingHorizontal: 16,
                            }}>
                                <Ionicons name="person-outline" size={20} color="#a8c5bf" />
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Adınız Soyadınız"
                                    placeholderTextColor="#4a7a72"
                                    style={{ flex: 1, color: '#fff', paddingVertical: 14, paddingLeft: 12, fontSize: 15 }}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={{ marginBottom: 18 }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                                E-posta
                            </Text>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#01241e', borderRadius: 14,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                                paddingHorizontal: 16,
                            }}>
                                <Ionicons name="mail-outline" size={20} color="#a8c5bf" />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ornek@email.com"
                                    placeholderTextColor="#4a7a72"
                                    style={{ flex: 1, color: '#fff', paddingVertical: 14, paddingLeft: 12, fontSize: 15 }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={{ marginBottom: 18 }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                                Şifre
                            </Text>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#01241e', borderRadius: 14,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                                paddingHorizontal: 16,
                            }}>
                                <Ionicons name="lock-closed-outline" size={20} color="#a8c5bf" />
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="En az 6 karakter"
                                    placeholderTextColor="#4a7a72"
                                    secureTextEntry
                                    style={{ flex: 1, color: '#fff', paddingVertical: 14, paddingLeft: 12, fontSize: 15 }}
                                />
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={{ marginBottom: 28 }}>
                            <Text style={{ color: '#a8c5bf', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                                Şifre Tekrar
                            </Text>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#01241e', borderRadius: 14,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                                paddingHorizontal: 16,
                            }}>
                                <Ionicons name="lock-closed-outline" size={20} color="#a8c5bf" />
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Şifrenizi tekrar girin"
                                    placeholderTextColor="#4a7a72"
                                    secureTextEntry
                                    style={{ flex: 1, color: '#fff', paddingVertical: 14, paddingLeft: 12, fontSize: 15 }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            style={{
                                backgroundColor: '#70c5bb',
                                paddingVertical: 16, borderRadius: 14,
                                alignItems: 'center', opacity: loading ? 0.6 : 1,
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: '#01241e', fontSize: 16, fontWeight: '700' }}>
                                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
                        <Text style={{ color: '#a8c5bf', fontSize: 14 }}>Zaten hesabınız var mı? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '700' }}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
