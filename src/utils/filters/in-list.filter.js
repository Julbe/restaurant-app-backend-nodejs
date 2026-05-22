const createInListFilterBlock = ({
    key,
    field = key,
    allowedValues = null,
    separator = ",",
}) => ({
    keys: [key],
    build: (query) => {
        const rawValue = query[key];
        if (!rawValue) return null;

        const values = Array.isArray(rawValue)
            ? rawValue
            : typeof rawValue === "string"
                ? rawValue.split(separator).map((value) => value.trim()).filter(Boolean)
                : [];

        if (values.length === 0) return null;

        if (allowedValues?.length) {
            const invalidValues = values.filter((value) => !allowedValues.includes(value));
            if (invalidValues.length > 0) {
                throw new Error(
                    `El parámetro '${key}' contiene valores inválidos: ${invalidValues.join(", ")}`
                );
            }
        }

        return { [field]: { $in: values } };
    },
});

export {
    createInListFilterBlock,
};
