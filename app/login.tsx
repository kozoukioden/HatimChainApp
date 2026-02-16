import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { router } from 'expo-router';
import { AuthService } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Uyarı', 'Lütfen e-posta adresinizi girin.');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Uyarı', 'Lütfen şifrenizi girin.');
            return;
        }

        setLoading(true);
        const result = await AuthService.login(email.trim(), password);
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Hata', result.error || 'Giriş başarısız.');
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
                    {/* Logo Area */}
                    <View style={{ alignItems: 'center', marginBottom: 48 }}>
                        <View style={{
                            width: 88, height: 88, borderRadius: 44,
                            backgroundColor: 'rgba(112, 197, 187, 0.12)',
                            justifyContent: 'center', alignItems: 'center', marginBottom: 20,
                        }}>
                            <Ionicons name="book" size={44} color="#70c5bb" />
                        </View>
                        <Text style={{ color: '#D4AF37', fontSize: 26, fontWeight: '800', letterSpacing: 2 }}>
                            HATİM ZİNCİRİ
                        </Text>
                        <Text style={{ color: '#a8c5bf', fontSize: 14, marginTop: 6 }}>
                            Hesabınıza giriş yapın
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={{
                        backgroundColor: '#032b23', borderRadius: 20,
                        padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}>
                        <View style={{ marginBottom: 20 }}>
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

                        <View style={{ marginBottom: 28 }}>
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
                                    placeholder="Şifreniz"
                                    placeholderTextColor="#4a7a72"
                                    secureTextEntry={!showPassword}
                                    style={{ flex: 1, color: '#fff', paddingVertical: 14, paddingLeft: 12, fontSize: 15 }}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22} color="#a8c5bf"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={{
                                backgroundColor: '#70c5bb',
                                paddingVertical: 16, borderRadius: 14,
                                alignItems: 'center', opacity: loading ? 0.6 : 1,
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: '#01241e', fontSize: 16, fontWeight: '700' }}>
                                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
                        <Text style={{ color: '#a8c5bf', fontSize: 14 }}>Hesabınız yok mu? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '700' }}>Kayıt Ol</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
