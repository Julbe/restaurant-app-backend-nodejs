const generateCode = (prefix = "", length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix != '' ? prefix + "-" : ""}${code}`;
}

const generateUniqueCode = async (ExerciseModel, prefix = "", length = 5) => {
    let code;
    let exists = true;

    while (exists) {
        code = generateCode(prefix, length);
        exists = await ExerciseModel.findOne({ key: code });
    }

    return code;
}

const getLocalDateParts = (date = new Date(), timeZone = process.env.APP_TIMEZONE || "America/Mexico_City") => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return { year, month, day };
};

const getDailySequenceKey = (prefix = "", date = new Date(), timeZone = process.env.APP_TIMEZONE || "America/Mexico_City") => {
    const { year, month, day } = getLocalDateParts(date, timeZone);
    const dateKey = `${year}${month}${day}`;
    return prefix ? `${prefix}-${dateKey}` : dateKey;
};

export {
    generateCode,
    generateUniqueCode,
    getDailySequenceKey,
};
