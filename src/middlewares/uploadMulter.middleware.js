import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const singleFile = (nameField, callback) => [
    upload.single(nameField),
    callback
];
const multiFile = (callback) => [
    upload.any(),
    callback
];

export { singleFile, multiFile };