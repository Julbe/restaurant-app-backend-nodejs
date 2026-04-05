

/**
 * Construye un filtro seguro a partir de los parámetros recibidos en query, 
 * ignorando las claves reservadas y permitiendo búsquedas parciales con q.
 * 
 * Omite automáticamente claves comunes como page, limit, sortBy, etc.
 * Crea un objeto filter con solo las propiedades válidas.
 * Si existe query.q, genera una condición $or con una expresión regular ($regex) para los campos definidos en searchableFields.
 * 
 * @param {*} query  (Object): Objeto con los parámetros de búsqueda recibidos (por ejemplo, req.name).
 * @param {*} searchableFields (Array<string>): Campos en los que se aplicará la búsqueda de texto (q).
 * @param {*} omitKeys (Array<string>): Claves adicionales que se deben excluir del filtro. 
 * @returns 
 */

export const buildSafeFilter = (query, searchableFields = [], omitKeys = []) => {
    const filter = {};
    const excludedKeys = ["page", "limit", "sortBy",
        "sortOrder", "q", "_fields", "populate",
        "filterBlocks",
        ...omitKeys
    ];

    for (const key in query) {
        if (!excludedKeys.includes(key) && query[key] !== undefined && query[key] !== "") {
            filter[key] = query[key];
        }
    }

    if (query.q && searchableFields.length > 0) {
        const searchRegex = { $regex: query.q, $options: "i" };
        filter.$or = searchableFields.map((field) => ({ [field]: searchRegex }));
    }

    return filter;
};
