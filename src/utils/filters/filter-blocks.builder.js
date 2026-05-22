const createFilterBlocksBuilder = (availableBlocks = {}) => (query = {}) => {
    const requestedBlocks = query.filterBlocks
        ? query.filterBlocks.split(",").map((blockName) => blockName.trim()).filter(Boolean)
        : [];

    const activeBlocks = [];

    for (const blockName of requestedBlocks) {
        const block = availableBlocks[blockName];
        if (!block) continue;

        const missingKeys = (block.keys || []).filter((key) => !(key in query));
        if (missingKeys.length > 0) {
            return {
                error: `Filtro inválido (${blockName}). Faltan parámetros: ${missingKeys.join(", ")}`,
            };
        }

        const blockFilter = block.build(query);
        if (blockFilter) activeBlocks.push(blockFilter);
    }

    const omitKeys = requestedBlocks
        .map((blockName) => availableBlocks[blockName]?.keys || [])
        .flat();

    return [activeBlocks, omitKeys];
};

export {
    createFilterBlocksBuilder,
};
