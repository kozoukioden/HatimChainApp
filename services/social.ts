import { FirestoreREST } from './firestore-rest';

const FOLLOWS_COLLECTION = 'follows';

interface FollowEntry {
    followers: string[];
    following: string[];
}

async function getUserFollowData(userId: string): Promise<FollowEntry> {
    try {
        const doc = await FirestoreREST.getDoc(`${FOLLOWS_COLLECTION}/${userId}`);
        if (doc) {
            return doc.data as FollowEntry;
        }
        return { followers: [], following: [] };
    } catch {
        return { followers: [], following: [] };
    }
}

async function saveUserFollowData(userId: string, data: FollowEntry): Promise<void> {
    try {
        // Try to update first
        await FirestoreREST.updateDoc(`${FOLLOWS_COLLECTION}/${userId}`, data);
    } catch {
        // If document doesn't exist, create it — use a workaround with PATCH and full fields
        const url = `https://firestore.googleapis.com/v1/projects/hatim-zinciri-app/databases/(default)/documents/${FOLLOWS_COLLECTION}/${userId}?key=AIzaSyCOEHFwQE7BHT-G3DuPtLJjsxy04au3YqA`;
        await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    followers: { arrayValue: { values: data.followers.map(f => ({ stringValue: f })) } },
                    following: { arrayValue: { values: data.following.map(f => ({ stringValue: f })) } },
                }
            }),
        });
    }
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
