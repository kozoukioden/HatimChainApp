export interface KandilDate {
    name: string;
    date: string;
    description: string;
    icon: string;
}

// 2026 Diyanet İşleri Başkanlığı Resmi Takvimi
const KANDIL_DATES: KandilDate[] = [
    // 2025
    { name: 'Mevlid Kandili', date: '2025-09-04', description: 'Hz. Muhammed (s.a.v.)\'in doğum gecesi', icon: 'star-outline' },
    // 2026
    { name: 'Miraç Kandili', date: '2026-01-15', description: 'Hz. Muhammed (s.a.v.)\'in miraca yükseldiği gece', icon: 'arrow-up-outline' },
    { name: 'Berat Kandili', date: '2026-02-02', description: 'Şaban ayının 15. gecesi, günahların affedildiği gece', icon: 'shield-checkmark-outline' },
    { name: 'Kadir Gecesi', date: '2026-03-16', description: 'Kur\'an-ı Kerim\'in indirildiği gece, bin aydan hayırlı', icon: 'sparkles-outline' },
    { name: 'Mevlid Kandili', date: '2026-08-24', description: 'Hz. Muhammed (s.a.v.)\'in doğum gecesi', icon: 'star-outline' },
    { name: 'Regaip Kandili', date: '2026-12-10', description: 'Üç ayların başlangıcı, Recep ayının ilk Cuma gecesi', icon: 'moon-outline' },
    // 2027
    { name: 'Miraç Kandili', date: '2027-01-04', description: 'Miraç gecesi', icon: 'arrow-up-outline' },
    { name: 'Berat Kandili', date: '2027-01-22', description: 'Berat gecesi', icon: 'shield-checkmark-outline' },
    { name: 'Kadir Gecesi', date: '2027-03-06', description: 'Kadir gecesi', icon: 'sparkles-outline' },
];

export const KandilService = {
    getUpcomingKandils(count: number = 3): KandilDate[] {
        const today = new Date().toISOString().split('T')[0];
        return KANDIL_DATES.filter(k => k.date >= today).slice(0, count);
    },

    getNextKandil(): KandilDate | null {
        const today = new Date().toISOString().split('T')[0];
        return KANDIL_DATES.find(k => k.date >= today) || null;
    },

    getDaysUntil(dateStr: string): number {
        const target = new Date(dateStr + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    },
};
