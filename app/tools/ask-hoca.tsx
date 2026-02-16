import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { AppConfig } from '../../services/config';

const GROQ_API_KEY = AppConfig.GROQ_API_KEY;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AskHocaScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Selamün aleyküm. Ben Dini Sohbet Asistanınızım. Namaz, abdest, oruç veya diğer dini konularda sorularınızı cevaplayabilirim.' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "Sen bilgili, nazik ve Kuran ile Sünnet ışığında konuşan bir İslam alimisin (Sanal Hoca). Kullanıcıların sorduğu dini sorulara (namaz nasıl kılınır, abdest nasıl alınır, orucu ne bozar, günah, sevap vb.) net, doğru ve kaynaklara dayalı cevaplar ver. Her soruya mutlaka cevap ver, asla 'cevap veremiyorum' deme. Ayet ve hadis kaynaklarını belirt. Asla kaba olma. Türkçe konuş." },
                        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMsg.content }
                    ],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 2048,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error:', response.status, errorText);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'API bağlantısında bir sorun oluştu. Lütfen tekrar deneyin.' }]);
                return;
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
                const answer = data.choices[0].message.content;
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: answer }]);
            } else {
                console.error('Unexpected API response:', JSON.stringify(data));
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Bir sorun oluştu. Lütfen sorunuzu tekrar sorun.' }]);
            }
        } catch (e) {
            console.error('Network error:', e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#01241e' }}>
            <StatusBar style="light" />
            <Stack.Screen options={{ title: 'Dini Sohbet', headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb' }} />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                    <View style={{
                        alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: item.role === 'user' ? '#03453b' : '#032b23',
                        padding: 14, borderRadius: 16, marginBottom: 10,
                        maxWidth: '85%',
                        borderBottomRightRadius: item.role === 'user' ? 2 : 16,
                        borderBottomLeftRadius: item.role === 'assistant' ? 2 : 16,
                    }}>
                        <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22 }}>
                            {item.content}
                        </Text>
                    </View>
                )}
            />

            <View style={{
                padding: 16,
                paddingBottom: Math.max(insets.bottom, 16) + 8,
                backgroundColor: '#01241e',
                borderTopWidth: 1,
                borderTopColor: 'rgba(112,197,187,0.1)',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Sorunuzu yazın..."
                    placeholderTextColor="#4a7a72"
                    multiline
                    style={{
                        flex: 1, backgroundColor: '#032b23', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12,
                        color: '#fff', fontSize: 15, maxHeight: 100, marginRight: 10,
                    }}
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading || !inputText.trim()}
                    style={{
                        width: 48, height: 48, borderRadius: 24,
                        backgroundColor: loading || !inputText.trim() ? '#1f3d38' : '#70c5bb',
                        justifyContent: 'center', alignItems: 'center',
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name="send" size={20} color="#01241e" style={{ marginLeft: 2 }} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
