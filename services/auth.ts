import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import {
    collection, doc, getDocs, getDoc, setDoc, query, where, addDoc
} from 'firebase/firestore';
import * as Crypto from 'expo-crypto';
import { validateEmail, sanitizeInput } from './utils';

export interface User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdAt: string;
}

const USER_KEY = 'HATIM_CHAIN_USER';
const USERS_COLLECTION = 'users';

async function hashPassword(password: string): Promise<string> {
    try {
        return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
    } catch {
        return password;
    }
}

export const AuthService = {
    async getCurrentUser(): Promise<User | null> {
        try {
            const json = await AsyncStorage.getItem(USER_KEY);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async register(email: string, password: string, fullName: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            email = sanitizeInput(email.toLowerCase(), 100);
            fullName = sanitizeInput(fullName, 100);

            if (!validateEmail(email)) {
                return { success: false, error: 'Geçerli bir e-posta adresi girin.' };
            }
            if (password.length < 6) {
                return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };
            }
            if (fullName.length < 2) {
                return { success: false, error: 'Ad soyad en az 2 karakter olmalıdır.' };
            }

            // Check if user exists in Firestore
            const usersRef = collection(db, USERS_COLLECTION);
            const snapshot = await getDocs(usersRef);
            const existingUsers = snapshot.docs.map(d => d.data() as User);

            if (existingUsers.find(u => u.email === email)) {
                return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
            }

            const hashedPassword = await hashPassword(password);

            const user: User = {
                id: '',
                email,
                password: hashedPassword,
                fullName,
                createdAt: new Date().toISOString(),
            };

            // Add to Firestore and get auto-generated ID
            const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
            user.id = docRef.id;

            // Update the document with its own ID
            await setDoc(docRef, user);

            // Store locally for session
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

            return { success: true, user };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Kayıt sırasında bir hata oluştu.' };
        }
    },

    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            email = sanitizeInput(email.toLowerCase(), 100);

            if (!validateEmail(email)) {
                return { success: false, error: 'Geçerli bir e-posta adresi girin.' };
            }

            const hashedPassword = await hashPassword(password);

            // Check Firestore
            const usersRef = collection(db, USERS_COLLECTION);
            const snapshot = await getDocs(usersRef);
            const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as User[];

            let user = users.find(u => u.email === email && u.password === hashedPassword);
            if (!user) {
                user = users.find(u => u.email === email && u.password === password);
            }

            if (!user) {
                return { success: false, error: 'E-posta veya şifre hatalı.' };
            }

            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            return { success: true, user };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Giriş sırasında bir hata oluştu.' };
        }
    },

    async logout(): Promise<void> {
        await AsyncStorage.removeItem(USER_KEY);
    },

    async getAllUsers(): Promise<User[]> {
        try {
            const usersRef = collection(db, USERS_COLLECTION);
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
        } catch (e) {
            return [];
        }
    },
};
