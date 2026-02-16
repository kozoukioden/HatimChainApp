import { db } from './firebase';
import {
    collection, doc, getDoc, setDoc, updateDoc
} from 'firebase/firestore';

const FOLLOWS_COLLECTION = 'follows';

interface FollowEntry {
    followers: string[];
    following: string[];
}

async function getUserFollowData(userId: string): Promise<FollowEntry> {
    try {
        const docRef = doc(db, FOLLOWS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as FollowEntry;
        }
        return { followers: [], following: [] };
    } catch {
        return { followers: [], following: [] };
    }
}

async function saveUserFollowData(userId: string, data: FollowEntry): Promise<void> {
    const docRef = doc(db, FOLLOWS_COLLECTION, userId);
    await setDoc(docRef, data);
}

export const SocialService = {
    async followUser(currentUserId: string, targetUserId: string): Promise<boolean> {
        try {
            if (currentUserId === targetUserId) return false;
            const currentData = await getUserFollowData(currentUserId);
            const targetData = await getUserFollowData(targetUserId);

            if (currentData.following.includes(targetUserId)) return false;

            currentData.following.push(targetUserId);
            targetData.followers.push(currentUserId);

            await Promise.all([
                saveUserFollowData(currentUserId, currentData),
                saveUserFollowData(targetUserId, targetData),
            ]);
            return true;
        } catch {
            return false;
        }
    },

    async unfollowUser(currentUserId: string, targetUserId: string): Promise<boolean> {
        try {
            const currentData = await getUserFollowData(currentUserId);
            const targetData = await getUserFollowData(targetUserId);

            currentData.following = currentData.following.filter(id => id !== targetUserId);
            targetData.followers = targetData.followers.filter(id => id !== currentUserId);

            await Promise.all([
                saveUserFollowData(currentUserId, currentData),
                saveUserFollowData(targetUserId, targetData),
            ]);
            return true;
        } catch {
            return false;
        }
    },

    async getFollowers(userId: string): Promise<string[]> {
        const data = await getUserFollowData(userId);
        return data.followers;
    },

    async getFollowing(userId: string): Promise<string[]> {
        const data = await getUserFollowData(userId);
        return data.following;
    },

    async isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
        const data = await getUserFollowData(currentUserId);
        return data.following.includes(targetUserId);
    },

    async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
        const data = await getUserFollowData(userId);
        return {
            followers: data.followers.length,
            following: data.following.length,
        };
    },

    generateProfileCode(userId: string): string {
        return `HC-${userId}`;
    },

    parseProfileCode(code: string): string | null {
        if (code.startsWith('HC-')) return code.substring(3);
        return null;
    },
};
