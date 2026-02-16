import { db } from './firebase';
import {
    collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';

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

const CHAINS_COLLECTION = 'chains';

export const ChainService = {
    async getChains(type?: ChainType): Promise<Chain[]> {
        try {
            const chainsRef = collection(db, CHAINS_COLLECTION);
            const snapshot = await getDocs(chainsRef);
            let chains: Chain[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Chain[];

            // Sort by createdAt descending
            chains.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (type) {
                return chains.filter(c => c.type === type);
            }
            return chains;
        } catch (e) {
            console.error('getChains error:', e);
            return [];
        }
    },

    async getChainById(id: string): Promise<Chain | null> {
        try {
            const docRef = doc(db, CHAINS_COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Chain;
            }
            return null;
        } catch (e) {
            console.error('getChainById error:', e);
            return null;
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
        const chain: Omit<Chain, 'id'> = {
            ...data,
            parts: Array.from({ length: data.totalParts }, (_, i) => ({
                number: i + 1,
                status: 'available' as const,
            })),
            participants: [data.createdBy],
            createdAt: new Date().toISOString(),
            isCompleted: false,
        };

        const docRef = await addDoc(collection(db, CHAINS_COLLECTION), chain);
        return { id: docRef.id, ...chain };
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

            if (!chain.participants.includes(userId)) {
                chain.participants.push(userId);
            }

            const docRef = doc(db, CHAINS_COLLECTION, chainId);
            await updateDoc(docRef, {
                parts: chain.parts,
                participants: chain.participants,
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

            chain.parts[partIndex].status = 'completed';

            const allCompleted = chain.parts.every(p => p.status === 'completed');

            const docRef = doc(db, CHAINS_COLLECTION, chainId);
            await updateDoc(docRef, {
                parts: chain.parts,
                isCompleted: allCompleted,
            });
            return true;
        } catch (e) {
            console.error('completePart error:', e);
            return false;
        }
    },

    async getMyChains(userId: string): Promise<Chain[]> {
        const chains = await this.getChains();
        return chains.filter(c => c.createdBy === userId || c.participants.includes(userId));
    },

    async deleteChain(chainId: string): Promise<boolean> {
        try {
            const docRef = doc(db, CHAINS_COLLECTION, chainId);
            await deleteDoc(docRef);
            return true;
        } catch (e) {
            console.error('deleteChain error:', e);
            return false;
        }
    },

    getProgress(chain: Chain): { completed: number; taken: number; available: number; percent: number } {
        const completed = chain.parts.filter(p => p.status === 'completed').length;
        const taken = chain.parts.filter(p => p.status === 'taken').length;
        const available = chain.parts.filter(p => p.status === 'available').length;
        const percent = chain.totalParts > 0 ? Math.round((completed / chain.totalParts) * 100) : 0;
        return { completed, taken, available, percent };
    },
};
