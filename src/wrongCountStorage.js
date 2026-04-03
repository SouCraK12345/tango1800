const WRONG_STORAGE_KEY = "wrong_counts_v1";
const CORRECT_STORAGE_KEY = "correct_counts_v1";

export function getWrongCounts() {
    try {
        const raw = localStorage.getItem(WRONG_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function getCorrectCounts() {
    try {
        const raw = localStorage.getItem(CORRECT_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function incrementWrongCount(englishWord) {
    if (!englishWord) return;
    const counts = getWrongCounts();
    counts[englishWord] = (counts[englishWord] || 0) + 1;
    localStorage.setItem(WRONG_STORAGE_KEY, JSON.stringify(counts));
}

export function incrementCorrectCount(englishWord) {
    if (!englishWord) return;
    const counts = getCorrectCounts();
    counts[englishWord] = (counts[englishWord] || 0) + 1;
    localStorage.setItem(CORRECT_STORAGE_KEY, JSON.stringify(counts));
}
