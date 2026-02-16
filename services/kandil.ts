export interface KandilDate {
    name: string;
    date: string;
    description: string;
    icon: string;
}

const KANDIL_DATES: KandilDate[] = [
    { name: 'Mevlid Kandili', date: '2025-09-04', description: 'Hz. Muhammed (s.a.v.)\'in doğum gecesi', icon: 'star-outline' },
    { name: 'Regaip Kandili', date: '2026-01-29', description: 'Üç ayların başlangıcı, Recep ayının ilk Cuma gecesi', icon: 'moon-outline' },
    { name: 'Miraç Kandili', date: '2026-02-18', description: 'Hz. Muhammed (s.a.v.)\'in miraca yükseldiği gece', icon: 'arrow-up-outline' },
    { name: 'Berat Kandili', date: '2026-03-05', description: 'Şaban ayının 15. gecesi, günahların affedildiği gece', icon: 'shield-checkmark-outline' },
    { name: 'Kadir Gecesi', date: '2026-04-01', description: 'Kur\'an-ı Kerim\'in indirildiği gece, bin aydan hayırlı', icon: 'sparkles-outline' },
    { name: 'Mevlid Kandili', date: '2026-08-24', description: 'Hz. Muhammed (s.a.v.)\'in doğum gecesi', icon: 'star-outline' },
    { name: 'Regaip Kandili', date: '2027-01-18', description: 'Üç ayların başlangıcı', icon: 'moon-outline' },
    { name: 'Miraç Kandili', date: '2027-02-08', description: 'Miraç gecesi', icon: 'arrow-up-outline' },
    { name: 'Berat Kandili', date: '2027-02-22', description: 'Berat gecesi', icon: 'shield-checkmark-outline' },
    { name: 'Kadir Gecesi', date: '2027-03-20', description: 'Kadir gecesi', icon: 'sparkles-outline' },
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
