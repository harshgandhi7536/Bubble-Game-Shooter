// Custom star thresholds for individual levels.
// Format: [1-star score, 2-star score, 3-star score]

export const STAR_THRESHOLDS = {
    1: [200, 400, 600],
    2: [250, 500, 750],
    3: [300, 600, 900],
    4: [350, 700, 1050],
    5: [400, 800, 1200]
};

// Levels without manually defined thresholds
export function getStars(level, score) {

    const base = 200 + (level - 1) * 8;

    const thresholds = STAR_THRESHOLDS[level] || [
        base,
        base * 2,
        base * 3
    ];

    if (score >= thresholds[2]) return 3;
    if (score >= thresholds[1]) return 2;
    if (score >= thresholds[0]) return 1;

    return 0;
}