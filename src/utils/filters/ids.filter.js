import mongoose from "mongoose";
/**
 *  Objeto auxiliar para construir un filtro de búsqueda por un arreglo de ObjectIds en MongoDB.
 * 
 * Se utiliza dentro de funciones de consulta (por ejemplo, en un aggregate o find) para 
 * filtrar documentos cuyos _id estén dentro de una lista recibida por query.
 * 
 *  keys: ["_ids"], // Claves esperadas en la query
 *  build: (query) => { ... } // Función que construye el filtro
 * 
 */
const generalIdsFilter = {
    keys: ["_ids"],
    build: (query) => {
        const { _ids } = query;
        if (!_ids) return undefined;

        const idList = Array.isArray(_ids)
            ? _ids
            : typeof _ids === "string"
                ? _ids.split(",").map((id) => id.trim())
                : [];

        const validIds = idList.filter((id) => mongoose.Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            throw new Error("El parámetro 'ids' debe contener ObjectIds válidos");
        }

        return { _id: { $in: validIds } };
    },
};

export {
    generalIdsFilter
};