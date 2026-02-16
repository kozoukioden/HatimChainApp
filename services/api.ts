export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation?: string;
    numberOfAyahs: number;
    revelationType: string;
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    page: number;
}

const API_TIMEOUT = 10000;

function fetchWithTimeout(url: string, timeout: number = API_TIMEOUT): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

const SURAHS_FALLBACK: Surah[] = [
    { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', numberOfAyahs: 7, revelationType: 'Meccan' },
    { number: 2, name: 'البقرة', englishName: 'Al-Baqara', numberOfAyahs: 286, revelationType: 'Medinan' },
    { number: 3, name: 'آل عمران', englishName: 'Aal-Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
    { number: 4, name: 'النساء', englishName: 'An-Nisa', numberOfAyahs: 176, revelationType: 'Medinan' },
    { number: 5, name: 'المائدة', englishName: 'Al-Maida', numberOfAyahs: 120, revelationType: 'Medinan' },
    { number: 6, name: 'الأنعام', englishName: "Al-An'am", numberOfAyahs: 165, revelationType: 'Meccan' },
    { number: 7, name: 'الأعراف', englishName: "Al-A'raf", numberOfAyahs: 206, revelationType: 'Meccan' },
    { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', numberOfAyahs: 75, revelationType: 'Medinan' },
    { number: 9, name: 'التوبة', englishName: 'At-Tawba', numberOfAyahs: 129, revelationType: 'Medinan' },
    { number: 10, name: 'يونس', englishName: 'Yunus', numberOfAyahs: 109, revelationType: 'Meccan' },
    { number: 11, name: 'هود', englishName: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan' },
    { number: 12, name: 'يوسف', englishName: 'Yusuf', numberOfAyahs: 111, revelationType: 'Meccan' },
    { number: 13, name: 'الرعد', englishName: "Ar-Ra'd", numberOfAyahs: 43, revelationType: 'Medinan' },
    { number: 14, name: 'ابراهيم', englishName: 'Ibrahim', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 15, name: 'الحجر', englishName: 'Al-Hijr', numberOfAyahs: 99, revelationType: 'Meccan' },
    { number: 16, name: 'النحل', englishName: 'An-Nahl', numberOfAyahs: 128, revelationType: 'Meccan' },
    { number: 17, name: 'الإسراء', englishName: "Al-Isra'", numberOfAyahs: 111, revelationType: 'Meccan' },
    { number: 18, name: 'الكهف', englishName: 'Al-Kahf', numberOfAyahs: 110, revelationType: 'Meccan' },
    { number: 19, name: 'مريم', englishName: 'Maryam', numberOfAyahs: 98, revelationType: 'Meccan' },
    { number: 20, name: 'طه', englishName: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan' },
    { number: 21, name: 'الأنبياء', englishName: "Al-Anbiya'", numberOfAyahs: 112, revelationType: 'Meccan' },
    { number: 22, name: 'الحج', englishName: 'Al-Hajj', numberOfAyahs: 78, revelationType: 'Medinan' },
    { number: 23, name: 'المؤمنون', englishName: "Al-Mu'minun", numberOfAyahs: 118, revelationType: 'Meccan' },
    { number: 24, name: 'النور', englishName: 'An-Nur', numberOfAyahs: 64, revelationType: 'Medinan' },
    { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', numberOfAyahs: 77, revelationType: 'Meccan' },
    { number: 26, name: 'الشعراء', englishName: "Ash-Shu'ara'", numberOfAyahs: 227, revelationType: 'Meccan' },
    { number: 27, name: 'النمل', englishName: 'An-Naml', numberOfAyahs: 93, revelationType: 'Meccan' },
    { number: 28, name: 'القصص', englishName: 'Al-Qasas', numberOfAyahs: 88, revelationType: 'Meccan' },
    { number: 29, name: 'العنكبوت', englishName: "Al-'Ankabut", numberOfAyahs: 69, revelationType: 'Meccan' },
    { number: 30, name: 'الروم', englishName: 'Ar-Rum', numberOfAyahs: 60, revelationType: 'Meccan' },
    { number: 31, name: 'لقمان', englishName: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan' },
    { number: 32, name: 'السجدة', englishName: 'As-Sajda', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', numberOfAyahs: 73, revelationType: 'Medinan' },
    { number: 34, name: 'سبإ', englishName: "Saba'", numberOfAyahs: 54, revelationType: 'Meccan' },
    { number: 35, name: 'فاطر', englishName: 'Fatir', numberOfAyahs: 45, revelationType: 'Meccan' },
    { number: 36, name: 'يس', englishName: 'Ya-Sin', numberOfAyahs: 83, revelationType: 'Meccan' },
    { number: 37, name: 'الصافات', englishName: 'As-Saffat', numberOfAyahs: 182, revelationType: 'Meccan' },
    { number: 38, name: 'ص', englishName: 'Sad', numberOfAyahs: 88, revelationType: 'Meccan' },
    { number: 39, name: 'الزمر', englishName: 'Az-Zumar', numberOfAyahs: 75, revelationType: 'Meccan' },
    { number: 40, name: 'غافر', englishName: 'Ghafir', numberOfAyahs: 85, revelationType: 'Meccan' },
    { number: 41, name: 'فصلت', englishName: 'Fussilat', numberOfAyahs: 54, revelationType: 'Meccan' },
    { number: 42, name: 'الشورى', englishName: 'Ash-Shura', numberOfAyahs: 53, revelationType: 'Meccan' },
    { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', numberOfAyahs: 89, revelationType: 'Meccan' },
    { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', numberOfAyahs: 59, revelationType: 'Meccan' },
    { number: 45, name: 'الجاثية', englishName: 'Al-Jathiya', numberOfAyahs: 37, revelationType: 'Meccan' },
    { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', numberOfAyahs: 35, revelationType: 'Meccan' },
    { number: 47, name: 'محمد', englishName: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan' },
    { number: 48, name: 'الفتح', englishName: 'Al-Fath', numberOfAyahs: 29, revelationType: 'Medinan' },
    { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', numberOfAyahs: 18, revelationType: 'Medinan' },
    { number: 50, name: 'ق', englishName: 'Qaf', numberOfAyahs: 45, revelationType: 'Meccan' },
    { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', numberOfAyahs: 60, revelationType: 'Meccan' },
    { number: 52, name: 'الطور', englishName: 'At-Tur', numberOfAyahs: 49, revelationType: 'Meccan' },
    { number: 53, name: 'النجم', englishName: 'An-Najm', numberOfAyahs: 62, revelationType: 'Meccan' },
    { number: 54, name: 'القمر', englishName: 'Al-Qamar', numberOfAyahs: 55, revelationType: 'Meccan' },
    { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', numberOfAyahs: 78, revelationType: 'Medinan' },
    { number: 56, name: 'الواقعة', englishName: "Al-Waqi'a", numberOfAyahs: 96, revelationType: 'Meccan' },
    { number: 57, name: 'الحديد', englishName: 'Al-Hadid', numberOfAyahs: 29, revelationType: 'Medinan' },
    { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', numberOfAyahs: 22, revelationType: 'Medinan' },
    { number: 59, name: 'الحشر', englishName: 'Al-Hashr', numberOfAyahs: 24, revelationType: 'Medinan' },
    { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahana', numberOfAyahs: 13, revelationType: 'Medinan' },
    { number: 61, name: 'الصف', englishName: 'As-Saff', numberOfAyahs: 14, revelationType: 'Medinan' },
    { number: 62, name: 'الجمعة', englishName: "Al-Jumu'a", numberOfAyahs: 11, revelationType: 'Medinan' },
    { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', numberOfAyahs: 11, revelationType: 'Medinan' },
    { number: 64, name: 'التغابن', englishName: 'At-Taghabun', numberOfAyahs: 18, revelationType: 'Medinan' },
    { number: 65, name: 'الطلاق', englishName: 'At-Talaq', numberOfAyahs: 12, revelationType: 'Medinan' },
    { number: 66, name: 'التحريم', englishName: 'At-Tahrim', numberOfAyahs: 12, revelationType: 'Medinan' },
    { number: 67, name: 'الملك', englishName: 'Al-Mulk', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 68, name: 'القلم', englishName: 'Al-Qalam', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 69, name: 'الحاقة', englishName: 'Al-Haqqa', numberOfAyahs: 52, revelationType: 'Meccan' },
    { number: 70, name: 'المعارج', englishName: "Al-Ma'arij", numberOfAyahs: 44, revelationType: 'Meccan' },
    { number: 71, name: 'نوح', englishName: 'Nuh', numberOfAyahs: 28, revelationType: 'Meccan' },
    { number: 72, name: 'الجن', englishName: 'Al-Jinn', numberOfAyahs: 28, revelationType: 'Meccan' },
    { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', numberOfAyahs: 20, revelationType: 'Meccan' },
    { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', numberOfAyahs: 56, revelationType: 'Meccan' },
    { number: 75, name: 'القيامة', englishName: 'Al-Qiyama', numberOfAyahs: 40, revelationType: 'Meccan' },
    { number: 76, name: 'الانسان', englishName: 'Al-Insan', numberOfAyahs: 31, revelationType: 'Medinan' },
    { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', numberOfAyahs: 50, revelationType: 'Meccan' },
    { number: 78, name: 'النبإ', englishName: "An-Naba'", numberOfAyahs: 40, revelationType: 'Meccan' },
    { number: 79, name: 'النازعات', englishName: "An-Nazi'at", numberOfAyahs: 46, revelationType: 'Meccan' },
    { number: 80, name: 'عبس', englishName: 'Abasa', numberOfAyahs: 42, revelationType: 'Meccan' },
    { number: 81, name: 'التكوير', englishName: 'At-Takwir', numberOfAyahs: 29, revelationType: 'Meccan' },
    { number: 82, name: 'الإنفطار', englishName: 'Al-Infitar', numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', numberOfAyahs: 36, revelationType: 'Meccan' },
    { number: 84, name: 'الإنشقاق', englishName: 'Al-Inshiqaq', numberOfAyahs: 25, revelationType: 'Meccan' },
    { number: 85, name: 'البروج', englishName: 'Al-Buruj', numberOfAyahs: 22, revelationType: 'Meccan' },
    { number: 86, name: 'الطارق', englishName: 'At-Tariq', numberOfAyahs: 17, revelationType: 'Meccan' },
    { number: 87, name: 'الأعلى', englishName: "Al-A'la", numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiya', numberOfAyahs: 26, revelationType: 'Meccan' },
    { number: 89, name: 'الفجر', englishName: 'Al-Fajr', numberOfAyahs: 30, revelationType: 'Meccan' },
    { number: 90, name: 'البلد', englishName: 'Al-Balad', numberOfAyahs: 20, revelationType: 'Meccan' },
    { number: 91, name: 'الشمس', englishName: 'Ash-Shams', numberOfAyahs: 15, revelationType: 'Meccan' },
    { number: 92, name: 'الليل', englishName: 'Al-Layl', numberOfAyahs: 21, revelationType: 'Meccan' },
    { number: 93, name: 'الضحى', englishName: 'Ad-Duha', numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 95, name: 'التين', englishName: 'At-Tin', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 96, name: 'العلق', englishName: 'Al-Alaq', numberOfAyahs: 19, revelationType: 'Meccan' },
    { number: 97, name: 'القدر', englishName: 'Al-Qadr', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 98, name: 'البينة', englishName: 'Al-Bayyina', numberOfAyahs: 8, revelationType: 'Medinan' },
    { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzala', numberOfAyahs: 8, revelationType: 'Medinan' },
    { number: 100, name: 'العاديات', englishName: "Al-'Adiyat", numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 101, name: 'القارعة', englishName: "Al-Qari'a", numberOfAyahs: 11, revelationType: 'Meccan' },
    { number: 102, name: 'التكاثر', englishName: 'At-Takathur', numberOfAyahs: 8, revelationType: 'Meccan' },
    { number: 103, name: 'العصر', englishName: 'Al-Asr', numberOfAyahs: 3, revelationType: 'Meccan' },
    { number: 104, name: 'الهمزة', englishName: 'Al-Humaza', numberOfAyahs: 9, revelationType: 'Meccan' },
    { number: 105, name: 'الفيل', englishName: 'Al-Fil', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 106, name: 'قريش', englishName: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan' },
    { number: 107, name: 'الماعون', englishName: "Al-Ma'un", numberOfAyahs: 7, revelationType: 'Meccan' },
    { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', numberOfAyahs: 3, revelationType: 'Meccan' },
    { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', numberOfAyahs: 6, revelationType: 'Meccan' },
    { number: 110, name: 'النصر', englishName: 'An-Nasr', numberOfAyahs: 3, revelationType: 'Medinan' },
    { number: 111, name: 'المسد', englishName: 'Al-Masad', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', numberOfAyahs: 4, revelationType: 'Meccan' },
    { number: 113, name: 'الفلق', englishName: 'Al-Falaq', numberOfAyahs: 5, revelationType: 'Meccan' },
    { number: 114, name: 'الناس', englishName: 'An-Nas', numberOfAyahs: 6, revelationType: 'Meccan' },
];

export const PrayerService = {
    async getPrayerTimes(city: string = 'Istanbul', country: string = 'Turkey'): Promise<PrayerTimes | null> {
        try {
            const response = await fetchWithTimeout(
                `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=13`
            );
            const data = await response.json();
            return data?.data?.timings || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async getPrayerTimesByLocation(lat: number, lng: number): Promise<PrayerTimes | null> {
        try {
            const response = await fetchWithTimeout(
                `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`
            );
            const data = await response.json();
            return data?.data?.timings || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async getSurahs(): Promise<Surah[]> {
        try {
            const response = await fetchWithTimeout('https://api.aladhan.com/v1/surah');
            const data = await response.json();
            if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
                return data.data;
            }
            return SURAHS_FALLBACK;
        } catch (e) {
            console.error(e);
            return SURAHS_FALLBACK;
        }
    },

    async getSurahAyahs(surahNumber: number): Promise<{ arabic: Ayah[]; turkish: string[] }> {
        try {
            const [arabicRes, turkishRes] = await Promise.all([
                fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
                fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}/tr.diyanet`),
            ]);
            const arabicData = await arabicRes.json();
            const turkishData = await turkishRes.json();
            return {
                arabic: arabicData?.data?.ayahs || [],
                turkish: turkishData?.data?.ayahs?.map((a: any) => a.text) || [],
            };
        } catch (e) {
            console.error(e);
            return { arabic: [], turkish: [] };
        }
    },

    getSurahsFallback(): Surah[] {
        return SURAHS_FALLBACK;
    },
};
