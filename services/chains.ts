import { FirestoreREST } from './firestore-rest';

export type ChainType = 'hatim' | 'salavat' | 'sure' | 'dua' | 'topludua';

export interface ChainPart {
    number: number;
    status: 'available' | 'taken' | 'completed';
    takenBy?: string;
    takenByName?: string;
}

export interface Chain {
    id: string;
    type: ChainType;
    title: string;
    description: string;
    createdBy: string;
    createdByName: string;
    startDate: string;
    endDate: string;
    totalParts: number;
    parts: ChainPart[];
    participants: string[];
    createdAt: string;
    isCompleted: boolean;
    sureName?: string;
    liveStreamUrl?: string;
    niyetDescription?: string;
    hiddenParticipants?: boolean;
}

const COLLECTION = 'chains';

export const ChainService = {
    async getAllChains(): Promise<Chain[]> {
        try {
            const docs = await FirestoreREST.listDocs(COLLECTION);
            return docs.map(d => ({ id: d.id, ...d.data } as Chain));
        } catch (e) {
            console.error('getAllChains error:', e);
            return [];
        }
    },

    async getChainById(chainId: string): Promise<Chain | null> {
        try {
            const doc = await FirestoreREST.getDoc(`${COLLECTION}/${chainId}`);
            if (!doc) return null;
            return { id: doc.id, ...doc.data } as Chain;
        } catch (e) {
            console.error('getChainById error:', e);
            return null;
        }
    },

    async getChainsByUser(userId: string): Promise<Chain[]> {
        try {
            const allChains = await this.getAllChains();
            return allChains.filter(c =>
                c.createdBy === userId || (c.participants && c.participants.includes(userId))
            );
        } catch (e) {
            console.error('getChainsByUser error:', e);
            return [];
        }
    },

    async createChain(data: {
        type: ChainType;
        title: string;
        description: string;
        createdBy: string;
        createdByName: string;
        startDate: string;
        endDate: string;
        totalParts: number;
        sureName?: string;
        liveStreamUrl?: string;
        niyetDescription?: string;
        hiddenParticipants?: boolean;
    }): Promise<Chain> {
        try {
            // Build chain object, excluding undefined values
            const chainData: any = {
                type: data.type,
                title: data.title,
                description: data.description,
                createdBy: data.createdBy,
                createdByName: data.createdByName,
                startDate: data.startDate,
                endDate: data.endDate,
                totalParts: data.totalParts,
                parts: Array.from({ length: data.totalParts }, (_, i) => ({
                    number: i + 1,
                    status: 'available',
                })),
                participants: [data.createdBy],
                createdAt: new Date().toISOString(),
                isCompleted: false,
            };

            // Only add optional fields if they have values
            if (data.sureName) chainData.sureName = data.sureName;
            if (data.liveStreamUrl) chainData.liveStreamUrl = data.liveStreamUrl;
            if (data.niyetDescription) chainData.niyetDescription = data.niyetDescription;
            if (data.hiddenParticipants !== undefined) chainData.hiddenParticipants = data.hiddenParticipants;

            const result = await FirestoreREST.createDoc(COLLECTION, chainData);
            return { id: result.id, ...chainData } as Chain;
        } catch (e) {
            console.error('createChain error:', e);
            throw e;
        }
    },

    async claimPart(chainId: string, partNumber: number, userId: string, userName: string): Promise<boolean> {
        try {
            const chain = await this.getChainById(chainId);
            if (!chain) return false;

            const partIndex = chain.parts.findIndex(p => p.number === partNumber);
            if (partIndex === -1 || chain.parts[partIndex].status !== 'available') return false;

            chain.parts[partIndex] = {
                ...chain.parts[partIndex],
                status: 'taken',
                takenBy: userId,
                takenByName: userName,
            };

            const participants = chain.participants.includes(userId)
                ? chain.participants
                : [...chain.participants, userId];

            await FirestoreREST.updateDoc(`${COLLECTION}/${chainId}`, {
                parts: chain.parts,
                participants: participants,
            });
            return true;
        } catch (e) {
            console.error('claimPart error:', e);
            return false;
        }
    },

    async completePart(chainId: string, partNumber: number): Promise<boolean> {
        try {
            const chain = await this.getChainById(chainId);
            if (!chain) return false;

            const partIndex = chain.parts.findIndex(p => p.number === partNumber);
            if (partIndex === -1) return false;

            chain.parts[partIndex] = { ...chain.parts[partIndex], status: 'completed' };

            const isCompleted = chain.parts.every(p => p.status === 'completed');

            await FirestoreREST.updateDoc(`${COLLECTION}/${chainId}`, {
                parts: chain.parts,
                isCompleted,
            });
            return true;
        } catch (e) {
            console.error('completePart error:', e);
            return false;
        }
    },

    async deleteChain(chainId: string): Promise<boolean> {
        try {
            await FirestoreREST.deleteDoc(`${COLLECTION}/${chainId}`);
            return true;
        } catch (e) {
            console.error('deleteChain error:', e);
            return false;
        }
    },

    async searchChainsByCode(code: string): Promise<Chain[]> {
        try {
            const allChains = await this.getAllChains();
            return allChains.filter(c =>
                c.id.toLowerCase().includes(code.toLowerCase()) ||
                c.title.toLowerCase().includes(code.toLowerCase())
            );
        } catch (e) {
            console.error('searchChainsByCode error:', e);
            return [];
        }
    },

    async getRecentChains(limit: number = 10): Promise<Chain[]> {
        try {
            const allChains = await this.getAllChains();
            return allChains
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit);
        } catch (e) {
            console.error('getRecentChains error:', e);
            return [];
        }
    },

    getProgress(chain: Chain): { percent: number; completed: number; taken: number; available: number } {
        if (!chain || !chain.parts || chain.parts.length === 0) {
            return { percent: 0, completed: 0, taken: 0, available: 0 };
        }
        const total = chain.parts.length;
        const completed = chain.parts.filter(p => p.status === 'completed').length;
        const taken = chain.parts.filter(p => p.status === 'taken').length;
        const available = chain.parts.filter(p => p.status === 'available').length;
        const percent = Math.round((completed / total) * 100);
        return { percent, completed, taken, available };
    },
};
