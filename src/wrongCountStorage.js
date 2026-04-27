const WRONG_STORAGE_KEY = "wrong_counts_v1";
const CORRECT_STORAGE_KEY = "correct_counts_v1";
const MIGRATION_STORAGE_KEY_PREFIX = "counts_dict_migration_v1_done";

function normalizeDictId(dictId) {
    if (dictId === undefined || dictId === null || dictId === "") return "0";
    return String(dictId);
}

function buildStorageKey(baseKey, dictId) {
    return `${baseKey}_dict_${normalizeDictId(dictId)}`;
}

function migrateLegacyCountsIfNeeded(baseKey, dictId) {
    const normalizedDictId = normalizeDictId(dictId);
    if (normalizedDictId !== "0") return;
    const migrationStatusKey = `${MIGRATION_STORAGE_KEY_PREFIX}_${baseKey}`;
    if (localStorage.getItem(migrationStatusKey) === "1") return;

    const newStorageKey = buildStorageKey(baseKey, normalizedDictId);
    const current = localStorage.getItem(newStorageKey);
    const legacy = localStorage.getItem(baseKey);
    if (!current && legacy) {
        localStorage.setItem(newStorageKey, legacy);
    }

    localStorage.setItem(migrationStatusKey, "1");
}

export function getWrongCounts(dictId) {
    try {
        migrateLegacyCountsIfNeeded(WRONG_STORAGE_KEY, dictId);
        const storageKey = buildStorageKey(WRONG_STORAGE_KEY, dictId);
        const raw = localStorage.getItem(storageKey);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function getCorrectCounts(dictId) {
    try {
        migrateLegacyCountsIfNeeded(CORRECT_STORAGE_KEY, dictId);
        const storageKey = buildStorageKey(CORRECT_STORAGE_KEY, dictId);
        const raw = localStorage.getItem(storageKey);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function incrementWrongCount(englishWord, dictId) {
    if (!englishWord) return;
    const storageKey = buildStorageKey(WRONG_STORAGE_KEY, dictId);
    const counts = getWrongCounts(dictId);
    counts[englishWord] = (counts[englishWord] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(counts));
}

export function incrementCorrectCount(englishWord, dictId) {
    if (!englishWord) return;
    const storageKey = buildStorageKey(CORRECT_STORAGE_KEY, dictId);
    const counts = getCorrectCounts(dictId);
    counts[englishWord] = (counts[englishWord] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(counts));
}
