export function censorName(name: string): string {
    if (!name) return '';
    return name
        .split(' ')
        .map(w => (w.length > 0 ? w[0] + '***' : ''))
        .join(' ');
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
        return dateStr;
    }
}

export function formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
        return dateStr;
    }
}

export function getCountdown(endDateStr: string): { days: number; hours: number; minutes: number; seconds: number; expired: boolean } {
    const now = new Date().getTime();
    const end = new Date(endDateStr).getTime();
    const diff = end - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
    };
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeInput(input: string, maxLength: number = 500): string {
    return input.trim().slice(0, maxLength);
}
