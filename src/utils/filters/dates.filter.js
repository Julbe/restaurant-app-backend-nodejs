
const dateRangeBlock = {
    keys: ["startDate", "endDate"],
    build: (query) => {
        const { startDate, endDate } = query;
        if (!startDate && !endDate) return null;

        const range = {};
        if (startDate) range.$gte = new Date(startDate);
        if (endDate) range.$lte = new Date(endDate);

        return { createdAt: range };
    },
};

export {
    dateRangeBlock
};