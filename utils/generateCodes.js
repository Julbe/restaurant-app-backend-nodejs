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


export {
    generateCode,
    generateUniqueCode
};