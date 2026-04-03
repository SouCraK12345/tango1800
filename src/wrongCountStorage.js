const STORAGE_KEY = "wrong_counts_v1";

export function getWrongCounts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}
