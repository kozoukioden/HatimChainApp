import { ChainService } from './chains';
import { AuthService } from './auth';

export interface UserStats {
    userId: string;
    fullName: string;
    chainsCreated: number;
    chainsJoined: number;
    partsCompleted: number;
    partsTaken: number;
    suresCompleted: number;
    cuzCompleted: number;
    totalScore: number;
}

export const LeaderboardService = {
    async getTopUsers(): Promise<UserStats[]> {
        try {
            const users = await AuthService.getAllUsers();
            const chains = await ChainService.getChains();

            const statsMap: Record<string, UserStats> = {};

            for (const user of users) {
                statsMap[user.id] = {
                    userId: user.id,
                    fullName: user.fullName,
                    chainsCreated: 0,
                    chainsJoined: 0,
                    partsCompleted: 0,
                    partsTaken: 0,
                    suresCompleted: 0,
                    cuzCompleted: 0,
                    totalScore: 0,
                };
            }

            for (const chain of chains) {
                if (statsMap[chain.createdBy]) {
                    statsMap[chain.createdBy].chainsCreated++;
                }

                for (const participant of chain.participants) {
                    if (statsMap[participant]) {
                        statsMap[participant].chainsJoined++;
                    }
                }

                for (const part of chain.parts) {
                    if (part.takenBy && statsMap[part.takenBy]) {
                        if (part.status === 'completed') {
                            statsMap[part.takenBy].partsCompleted++;
                            if (chain.type === 'sure') {
                                statsMap[part.takenBy].suresCompleted++;
                            }
                            if (chain.type === 'hatim') {
                                statsMap[part.takenBy].cuzCompleted++;
                            }
                        } else if (part.status === 'taken') {
                            statsMap[part.takenBy].partsTaken++;
                        }
                    }
                }
            }

            const statsList = Object.values(statsMap).map(s => ({
                ...s,
                totalScore: s.partsCompleted * 10 + s.partsTaken * 3 + s.chainsCreated * 5 + s.chainsJoined * 2,
            }));

            statsList.sort((a, b) => b.totalScore - a.totalScore);
            return statsList;
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getUserStats(userId: string): Promise<UserStats | null> {
        const all = await this.getTopUsers();
        return all.find(s => s.userId === userId) || null;
    },
};
