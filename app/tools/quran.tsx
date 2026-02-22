import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrayerService, Surah } from '../../services/api';

const SURAHS_FALLBACK: Surah[] = [
    { number: 1, name: '\u0627\u0644\u0641\u0627\u062a\u062d\u0629', englishName: 'Al-Fatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
    { number: 2, name: '\u0627\u0644\u0628\u0642\u0631\u0629', englishName: 'Al-Baqara', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
    { number: 3, name: '\u0622\u0644 \u0639\u0645\u0631\u0627\u0646', englishName: 'Aal-E-Imran', englishNameTranslation: 'The Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
    { number: 4, name: '\u0627\u0644\u0646\u0633\u0627\u0621', englishName: 'An-Nisa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan' },
    { number: 5, name: '\u0627\u0644\u0645\u0627\u0626\u062f\u0629', englishName: 'Al-Maida', englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan' },
    { number: 6, name: '\u0627\u0644\u0623\u0646\u0639\u0627\u0645', englishName: 'Al-Anaam', englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan' },
    { number: 7, name: '\u0627\u0644\u0623\u0639\u0631\u0627\u0641', englishName: 'Al-Araf', englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan' },
    { number: 8, name: '\u0627\u0644\u0623\u0646\u0641\u0627\u0644', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan' },
    { number: 9, name: '\u0627\u0644\u062a\u0648\u0628\u0629', englishName: 'At-Tawba', englishNameTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan' },
    { number: 10, name: '\u064a\u0648\u0646\u0633', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan' },
    { number: 11, name: '\u0647\u0648\u062f', englishName: 'Hud', englishNameTranslation: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan' },
    { number: 12, name: '\u064a\u0648\u0633\u0641', englishName: 'Yusuf', englishNameTranslation: 'Joseph', numberOfAyahs: 111, revelationType: 'Meccan' },
    { number: 13, name: '\u0627\u0644\u0631\u0639\u062f', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', numberOfAyahs: 43, revelationType: 'Medinan' },
    { number: 14, name: '\u0625\u0628\u0631\u0627\u0647\u064a\u0645', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 15, name: '\u0627\u0644\u062d\u062c\u0631', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', numberOfAyahs: 99, revelationType: 'Meccan' },
    { number: 16, name: '\u0627\u0644\u0646\u062d\u0644', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', numberOfAyahs: 128, revelationType: 'Meccan' },
    { number: 17, name: '\u0627\u0644\u0625\u0633\u0631\u0627\u0621', englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', numberOfAyahs: 111, revelationType: 'Meccan' },
    { number: 18, name: '\u0627\u0644\u0643\u0647\u0641', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan' },
    { number: 19, name: '\u0645\u0631\u064a\u0645', englishName: 'Maryam', englishNameTranslation: 'Mary', numberOfAyahs: 98, revelationType: 'Meccan' },
    { number: 20, name: '\u0637\u0647', englishName: 'Taha', englishNameTranslation: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan' },
    { number: 21, name: '\u0627\u0644\u0623\u0646\u0628\u064a\u0627\u0621', englishName: 'Al-Anbiya', englishNameTranslation: 'The Prophets', numberOfAyahs: 112, revelationType: 'Meccan' },
    { number: 22, name: '\u0627\u0644\u062d\u062c', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', numberOfAyahs: 78, revelationType: 'Medinan' },
    { number: 23, name: '\u0627\u0644\u0645\u0624\u0645\u0646\u0648\u0646', englishName: 'Al-Muminun', englishNameTranslation: 'The Believers', numberOfAyahs: 118, revelationType: 'Meccan' },
    { number: 24, name: '\u0627\u0644\u0646\u0648\u0631', englishName: 'An-Nur', englishNameTranslation: 'The Light', numberOfAyahs: 64, revelationType: 'Medinan' },
    { number: 25, name: '\u0627\u0644\u0641\u0631\u0642\u0627\u0646', englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', numberOfAyahs: 77, revelationType: 'Meccan' },
    { number: 26, name: '\u0627\u0644\u0634\u0639\u0631\u0627\u0621', englishName: 'Ash-Shuara', englishNameTranslation: 'The Poets', numberOfAyahs: 227, revelationType: 'Meccan' },
    { number: 27, name: '\u0627\u0644\u0646\u0645\u0644', englishName: 'An-Naml', englishNameTranslation: 'The Ant', numberOfAyahs: 93, revelationType: 'Meccan' },
    { number: 28, name: '\u0627\u0644\u0642\u0635\u0635', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', numberOfAyahs: 88, revelationType: 'Meccan' },
    { number: 29, name: '\u0627\u0644\u0639\u0646\u0643\u0628\u0648\u062a', englishName: 'Al-Ankabut', englishNameTranslation: 'The Spider', numberOfAyahs: 69, revelationType: 'Meccan' },
    { number: 30, name: '\u0627\u0644\u0631\u0648\u0645', englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', numberOfAyahs: 60, revelationType: 'Meccan' },
    { number: 31, name: '\u0644\u0642\u0645\u0627\u0646', englishName: 'Luqman', englishNameTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan' },
    { number: 32, name: '\u0627\u0644\u0633\u062c\u062f\u0629', englishName: 'As-Sajda', englishNameTranslation: 'The Prostration', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 33, name: '\u0627\u0644\u0623\u062d\u0632\u0627\u0628', englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', numberOfAyahs: 73, revelationType: 'Medinan' },
    { number: 34, name: '\u0633\u0628\u0623', englishName: 'Saba', englishNameTranslation: 'Sheba', numberOfAyahs: 54, revelationType: 'Meccan' },
    { number: 35, name: '\u0641\u0627\u0637\u0631', englishName: 'Fatir', englishNameTranslation: 'Originator', numberOfAyahs: 45, revelationType: 'Meccan' },
    { number: 36, name: '\u064a\u0633', englishName: 'Ya-Sin', englishNameTranslation: 'Ya Sin', numberOfAyahs: 83, revelationType: 'Meccan' },
    { number: 37, name: '\u0627\u0644\u0635\u0627\u0641\u0627\u062a', englishName: 'As-Saffat', englishNameTranslation: 'Those who set the Ranks', numberOfAyahs: 182, revelationType: 'Meccan' },
    { number: 38, name: '\u0635', englishName: 'Sad', englishNameTranslation: 'The Letter Sad', numberOfAyahs: 88, revelationType: 'Meccan' },
    { number: 39, name: '\u0627\u0644\u0632\u0645\u0631', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', numberOfAyahs: 75, revelationType: 'Meccan' },
    { number: 40, name: '\u063a\u0627\u0641\u0631', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', numberOfAyahs: 85, revelationType: 'Meccan' },
    { number: 41, name: '\u0641\u0635\u0644\u062a', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', numberOfAyahs: 54, revelationType: 'Meccan' },
    { number: 42, name: '\u0627\u0644\u0634\u0648\u0631\u0649', englishName: 'Ash-Shuraa', englishNameTranslation: 'The Consultation', numberOfAyahs: 53, revelationType: 'Meccan' },
    { number: 43, name: '\u0627\u0644\u0632\u062e\u0631\u0641', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', numberOfAyahs: 89, revelationType: 'Meccan' },
    { number: 44, name: '\u0627\u0644\u062f\u062e\u0627\u0646', englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', numberOfAyahs: 59, revelationType: 'Meccan' },
    { number: 45, name: '\u0627\u0644\u062c\u0627\u062b\u064a\u0629', englishName: 'Al-Jathiya', englishNameTranslation: 'The Crouching', numberOfAyahs: 37, revelationType: 'Meccan' },
    { number: 46, name: '\u0627\u0644\u0623\u062d\u0642\u0627\u0641', englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', numberOfAyahs: 35, revelationType: 'Meccan' },
    { number: 47, name: '\u0645\u062d\u0645\u062f', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan' },
    { number: 48, name: '\u0627\u0644\u0641\u062a\u062d', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', numberOfAyahs: 29, revelationType: 'Medinan' },
    { number: 49, name: '\u0627\u0644\u062d\u062c\u0631\u0627\u062a', englishName: 'Al-Hujurat', englishNameTranslation: 'The Rooms', numberOfAyahs: 18, revelationType: 'Medinan' },
    { number: 50, name: '\u0642', englishName: 'Qaf', englishNameTranslation: 'The Letter Qaf', numberOfAyahs: 45, revelationType: 'Meccan' },
    { number: 51, name: '\u0627\u0644\u0630\u0627\u0631\u064a\u0627\u062a', englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', numberOfAyahs: 60, revelationType: 'Meccan' },
    { number: 52, name: '\u0627\u0644\u0637\u0648\u0631', englishName: 'At-Tur', englishNameTranslation: 'The Mount', numberOfAyahs: 49, revelationType: 'Meccan' },
    { number: 53, name: '\u0627\u0644\u0646\u062c\u0645', englishName: 'An-Najm', englishNameTranslation: 'The Star', numberOfAyahs: 62, revelationType: 'Meccan' },
    { number: 54, name: '\u0627\u0644\u0642\u0645\u0631', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', numberOfAyahs: 55, revelationType: 'Meccan' },
    { number: 55, name: '\u0627\u0644\u0631\u062d\u0645\u0646', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan' },
    { number: 56, name: '\u0627\u0644\u0648\u0627\u0642\u0639\u0629', englishName: 'Al-Waqia', englishNameTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'Meccan' },
    { number: 57, name: '\u0627\u0644\u062d\u062f\u064a\u062f', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', numberOfAyahs: 29, revelationType: 'Medinan' },
    { number: 58, name: '\u0627\u0644\u0645\u062c\u0627\u062f\u0644\u0629', englishName: 'Al-Mujadila', englishNameTranslation: 'The Pleading Woman', numberOfAyahs: 22, revelationType: 'Medinan' },
    { number: 59, name: '\u0627\u0644\u062d\u0634\u0631', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', numberOfAyahs: 24, revelationType: 'Medinan' },
    { number: 60, name: '\u0627\u0644\u0645\u0645\u062a\u062d\u0646\u0629', englishName: 'Al-Mumtahina', englishNameTranslation: 'She that is to be examined', numberOfAyahs: 13, revelationType: 'Medinan' },
    { number: 61, name: '\u0627\u0644\u0635\u0641', englishName: 'As-Saff', englishNameTranslation: 'The Ranks', numberOfAyahs: 14, revelationType: 'Medinan' },
    { number: 62, name: '\u0627\u0644\u062c\u0645\u0639\u0629', englishName: 'Al-Jumua', englishNameTranslation: 'The Congregation, Friday', numberOfAyahs: 11, revelationType: 'Medinan' },
    { number: 63, name: '\u0627\u0644\u0645\u0646\u0627\u0641\u0642\u0648\u0646', englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', numberOfAyahs: 11, revelationType: 'Medinan' },
    { number: 64, name: '\u0627\u0644\u062a\u063a\u0627\u0628\u0646', englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', numberOfAyahs: 18, revelationType: 'Medinan' },
    { number: 65, name: '\u0627\u0644\u0637\u0644\u0627\u0642', englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', numberOfAyahs: 12, revelationType: 'Medinan' },
    { number: 66, name: '\u0627\u0644\u062a\u062d\u0631\u064a\u0645', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', numberOfAyahs: 12, revelationType: 'Medinan' },
    { number: 67, name: '\u0627\u0644\u0645\u0644\u0643', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 68, name: '\u0627\u0644\u0642\u0644\u0645', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 69, name: '\u0627\u0644\u062d\u0627\u0642\u0629', englishName: 'Al-Haaqqa', englishNameTranslation: 'The Reality', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 70, name: '\u0627\u0644\u0645\u0639\u0627\u0631\u062c', englishName: 'Al-Maarij', englishNameTranslation: 'The Ascending Stairways', numberOfAyahs: 44, revelationType: 'Meccan' },
    { number: 71, name: '\u0646\u0648\u062d', englishName: 'Nuh', englishNameTranslation: 'Noah', numberOfAyahs: 28, revelationType: 'Meccan' },
    { number: 72, name: '\u0627\u0644\u062c\u0646', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', numberOfAyahs: 28, revelationType: 'Meccan' },
    { number: 73, name: '\u0627\u0644\u0645\u0632\u0645\u0644', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', numberOfAyahs: 20, revelationType: 'Meccan' },
    { number: 74, name: '\u0627\u0644\u0645\u062f\u062b\u0631', englishName: 'Al-Muddathir', englishNameTranslation: 'The Cloaked One', numberOfAyahs: 56, revelationType: 'Meccan' },
    { number: 75, name: '\u0627\u0644\u0642\u064a\u0627\u0645\u0629', englishName: 'Al-Qiyama', englishNameTranslation: 'The Resurrection', numberOfAyahs: 40, revelationType: 'Meccan' },
    { number: 76, name: '\u0627\u0644\u0625\u0646\u0633\u0627\u0646', englishName: 'Al-Insan', englishNameTranslation: 'The Man', numberOfAyahs: 31, revelationType: 'Medinan' },
    { number: 77, name: '\u0627\u0644\u0645\u0631\u0633\u0644\u0627\u062a', englishName: 'Al-Mursalat', englishNameTranslation: 'The Emissaries', numberOfAyahs: 50, revelationType: 'Meccan' },
    { number: 78, name: '\u0627\u0644\u0646\u0628\u0623', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'Meccan' },
    { number: 79, name: '\u0627\u0644\u0646\u0627\u0632\u0639\u0627\u062a', englishName: 'An-Naziat', englishNameTranslation: 'Those who drag forth', numberOfAyahs: 46, revelationType: 'Meccan' },
    { number: 80, name: '\u0639\u0628\u0633', englishName: 'Abasa', englishNameTranslation: 'He Frowned', numberOfAyahs: 42, revelationType: 'Meccan' },
    { number: 81, name: '\u0627\u0644\u062a\u0643\u0648\u064a\u0631', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', numberOfAyahs: 29, revelationType: 'Meccan' },
    { number: 82, name: '\u0627\u0644\u0625\u0646\u0641\u0637\u0627\u0631', englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 83, name: '\u0627\u0644\u0645\u0637\u0641\u0641\u064a\u0646', englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauding', numberOfAyahs: 36, revelationType: 'Meccan' },
    { number: 84, name: '\u0627\u0644\u0627\u0646\u0634\u0642\u0627\u0642', englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Sundering', numberOfAyahs: 25, revelationType: 'Meccan' },
    { number: 85, name: '\u0627\u0644\u0628\u0631\u0648\u062c', englishName: 'Al-Burooj', englishNameTranslation: 'The Mansions of the Stars', numberOfAyahs: 22, revelationType: 'Meccan' },
    { number: 86, name: '\u0627\u0644\u0637\u0627\u0631\u0642', englishName: 'At-Tariq', englishNameTranslation: 'The Nightcomer', numberOfAyahs: 17, revelationType: 'Meccan' },
    { number: 87, name: '\u0627\u0644\u0623\u0639\u0644\u0649', englishName: 'Al-Ala', englishNameTranslation: 'The Most High', numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 88, name: '\u0627\u0644\u063a\u0627\u0634\u064a\u0629', englishName: 'Al-Ghashiya', englishNameTranslation: 'The Overwhelming', numberOfAyahs: 26, revelationType: 'Meccan' },
    { number: 89, name: '\u0627\u0644\u0641\u062c\u0631', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 90, name: '\u0627\u0644\u0628\u0644\u062f', englishName: 'Al-Balad', englishNameTranslation: 'The City', numberOfAyahs: 20, revelationType: 'Meccan' },
    { number: 91, name: '\u0627\u0644\u0634\u0645\u0633', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', numberOfAyahs: 15, revelationType: 'Meccan' },
    { number: 92, name: '\u0627\u0644\u0644\u064a\u0644', englishName: 'Al-Lail', englishNameTranslation: 'The Night', numberOfAyahs: 21, revelationType: 'Meccan' },
    { number: 93, name: '\u0627\u0644\u0636\u062d\u0649', englishName: 'Ad-Dhuha', englishNameTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 94, name: '\u0627\u0644\u0634\u0631\u062d', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 95, name: '\u0627\u0644\u062a\u064a\u0646', englishName: 'At-Tin', englishNameTranslation: 'The Fig', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 96, name: '\u0627\u0644\u0639\u0644\u0642', englishName: 'Al-Alaq', englishNameTranslation: 'The Clot', numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 97, name: '\u0627\u0644\u0642\u062f\u0631', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 98, name: '\u0627\u0644\u0628\u064a\u0646\u0629', englishName: 'Al-Bayyina', englishNameTranslation: 'The Clear Proof', numberOfAyahs: 8, revelationType: 'Medinan' },
    { number: 99, name: '\u0627\u0644\u0632\u0644\u0632\u0644\u0629', englishName: 'Az-Zalzala', englishNameTranslation: 'The Earthquake', numberOfAyahs: 8, revelationType: 'Medinan' },
    { number: 100, name: '\u0627\u0644\u0639\u0627\u062f\u064a\u0627\u062a', englishName: 'Al-Adiyat', englishNameTranslation: 'The Courser', numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 101, name: '\u0627\u0644\u0642\u0627\u0631\u0639\u0629', englishName: 'Al-Qaria', englishNameTranslation: 'The Calamity', numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 102, name: '\u0627\u0644\u062a\u0643\u0627\u062b\u0631', englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in world increase', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 103, name: '\u0627\u0644\u0639\u0635\u0631', englishName: 'Al-Asr', englishNameTranslation: 'The Declining Day', numberOfAyahs: 3, revelationType: 'Meccan' },
    { number: 104, name: '\u0627\u0644\u0647\u0645\u0632\u0629', englishName: 'Al-Humaza', englishNameTranslation: 'The Traducer', numberOfAyahs: 9, revelationType: 'Meccan' },
    { number: 105, name: '\u0627\u0644\u0641\u064a\u0644', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 106, name: '\u0642\u0631\u064a\u0634', englishName: 'Quraysh', englishNameTranslation: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan' },
    { number: 107, name: '\u0627\u0644\u0645\u0627\u0639\u0648\u0646', englishName: 'Al-Maun', englishNameTranslation: 'The Small Kindnesses', numberOfAyahs: 7, revelationType: 'Meccan' },
    { number: 108, name: '\u0627\u0644\u0643\u0648\u062b\u0631', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'Meccan' },
    { number: 109, name: '\u0627\u0644\u0643\u0627\u0641\u0631\u0648\u0646', englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', numberOfAyahs: 6, revelationType: 'Meccan' },
    { number: 110, name: '\u0627\u0644\u0646\u0635\u0631', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', numberOfAyahs: 3, revelationType: 'Medinan' },
    { number: 111, name: '\u0627\u0644\u0645\u0633\u062f', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 112, name: '\u0627\u0644\u0625\u062e\u0644\u0627\u0635', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan' },
    { number: 113, name: '\u0627\u0644\u0641\u0644\u0642', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 114, name: '\u0627\u0644\u0646\u0627\u0633', englishName: 'An-Nas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan' },
];

export default function QuranToolScreen() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadSurahs(); }, []);

    const loadSurahs = async () => {
        try {
            const data = await PrayerService.getSurahs();
            if (data && data.length > 0) {
                setSurahs(data);
                setFilteredSurahs(data);
            } else {
                setSurahs(SURAHS_FALLBACK);
                setFilteredSurahs(SURAHS_FALLBACK);
            }
        } catch {
            setSurahs(SURAHS_FALLBACK);
            setFilteredSurahs(SURAHS_FALLBACK);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!search.trim()) {
            setFilteredSurahs(surahs);
        } else {
            const q = search.toLowerCase();
            setFilteredSurahs(surahs.filter(s =>
                s.englishName.toLowerCase().includes(q) ||
                s.name.includes(search) ||
                s.number.toString() === search
            ));
        }
    }, [search, surahs]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#01241e', justifyContent: 'center', alignItems: 'center' }}>
                <Stack.Screen options={{ title: "Kur'an-\u0131 Kerim", headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />
                <ActivityIndicator size="large" color="#70c5bb" />
                <Text style={{ color: '#a8c5bf', marginTop: 12, fontSize: 14 }}>Sureler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#01241e' }}>
            <Stack.Screen options={{ title: "Kur'an-\u0131 Kerim", headerStyle: { backgroundColor: '#01241e' }, headerTintColor: '#70c5bb', headerTitleStyle: { color: '#fff' } }} />

            {/* Search */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#032b23', borderRadius: 14, paddingHorizontal: 14,
                    borderWidth: 1, borderColor: 'rgba(112,197,187,0.1)',
                }}>
                    <Ionicons name="search" size={18} color="#4a7a72" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Sure ara..."
                        placeholderTextColor="#4a7a72"
                        style={{ flex: 1, color: '#fff', paddingVertical: 12, paddingLeft: 10, fontSize: 15 }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#4a7a72" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredSurahs}
                keyExtractor={(item) => item.number.toString()}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/surah/${item.number}`)}
                        style={{
                            backgroundColor: '#032b23', borderRadius: 14, padding: 16, marginBottom: 8,
                            flexDirection: 'row', alignItems: 'center',
                            borderWidth: 1, borderColor: 'rgba(112,197,187,0.08)',
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: 'rgba(112,197,187,0.08)',
                            justifyContent: 'center', alignItems: 'center', marginRight: 14,
                        }}>
                            <Text style={{ color: '#70c5bb', fontSize: 14, fontWeight: '700' }}>{item.number}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{item.englishName}</Text>
                            <Text style={{ color: '#4a7a72', fontSize: 12, marginTop: 2 }}>
                                {item.numberOfAyahs} ayet · {item.revelationType === 'Meccan' ? 'Mekki' : 'Medeni'}
                            </Text>
                        </View>
                        <Text style={{ color: '#D4AF37', fontSize: 18, fontWeight: '500' }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Ionicons name="book-outline" size={48} color="#4a7a72" />
                        <Text style={{ color: '#a8c5bf', fontSize: 16, marginTop: 16 }}>Sure bulunamadı.</Text>
                    </View>
                }
            />
        </View>
    );
}
