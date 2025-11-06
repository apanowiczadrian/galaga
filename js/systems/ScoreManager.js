// Score management system using localStorage
export class ScoreManager {
    constructor() {
        this.storageKey = 'spaceInvScores';
    }

    // Save a new score
    saveScore(playerData, score, wave, time) {
        const scores = this.getScores();

        const newScore = {
            nick: playerData.nick,
            email: playerData.email,
            score: score,
            wave: wave,
            time: time, // in seconds
            timestamp: Date.now()
        };

        scores.push(newScore);

        // Sort by score (descending), then by time (ascending - faster is better)
        scores.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.time - b.time;
        });

        // Keep only top 100 scores
        const topScores = scores.slice(0, 100);

        localStorage.setItem(this.storageKey, JSON.stringify(topScores));

        return newScore;
    }

    // Get all scores from localStorage
    getScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading scores:', e);
            return [];
        }
    }

    // Get top N scores
    getTopScores(limit = 4) {
        const scores = this.getScores();
        return scores.slice(0, limit);
    }

    // Clear all scores (for testing)
    clearScores() {
        localStorage.removeItem(this.storageKey);
    }

    // Check if a score makes it to top N
    isTopScore(score, limit = 4) {
        const topScores = this.getTopScores(limit);
        if (topScores.length < limit) return true;
        return score > topScores[topScores.length - 1].score;
    }

    // Find player's rank in leaderboard (1-indexed)
    // Returns object with rank and score data, or null if not found
    findPlayerRank(playerData, score, time) {
        const scores = this.getScores();

        // Find the exact score entry matching player, score, and time
        for (let i = 0; i < scores.length; i++) {
            const scoreData = scores[i];
            if (scoreData.nick === playerData.nick &&
                Math.abs(scoreData.score - score) < 1 &&
                Math.abs(scoreData.time - time) < 1) {
                return {
                    rank: i + 1, // 1-indexed
                    data: scoreData
                };
            }
        }

        return null;
    }
}
