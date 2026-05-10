const normalizeSelect = (select) => {
    if (!select) return undefined;
    if (Array.isArray(select)) return select.join(" ");
    return select;
};

const buildPopulateEntry = (populateEntry, populateGroups = {}) => {
    if (!populateEntry) return null;

    if (typeof populateEntry === "string") {
        const select = normalizeSelect(populateGroups[populateEntry]);
        return select ? { path: populateEntry, select } : populateEntry;
    }

    if (typeof populateEntry === "object" && populateEntry.path) {
        const groupSelect = normalizeSelect(populateGroups[populateEntry.path]);

        if (!groupSelect || populateEntry.select) {
            return populateEntry;
        }

        return {
            ...populateEntry,
            select: groupSelect,
        };
    }

    return populateEntry;
};

export const buildPopulateOptions = (populate = [], populateGroups = {}) => {
    if (!populate) return [];

    const entries = Array.isArray(populate) ? populate : [populate];

    return entries
        .map((entry) => buildPopulateEntry(entry, populateGroups))
        .filter(Boolean);
};
