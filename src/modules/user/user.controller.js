
import { catchAsync } from "../../utils/catchAsync.js";
import { generateCode } from "../../utils/generateCodes.js";
import BaseController from "../baseController.js";
import { UserM } from "./user.model.js";

import bcrypt from "bcrypt";

export default class UserController extends BaseController {
  constructor() {
    super(UserM, "User", ["user"], [], ["roleId"]);
  }
  create = catchAsync(async (req, res) => {
    const { user, password, roleId, employeeId, customerId } = req.body;
    let defaultPassword = null;
    let hashedPassword = "";

    // Verificar si el correo ya existe
    const existing = await UserM.findOne({ user });
    if (existing) {
      return res.status(400).json({ message: "El Usuario ya está registrado" });
    }

    if (!password) {
      defaultPassword = generateCode(`${user[0] ?? 'P'}`, 6);
      hashedPassword = await bcrypt.hash(defaultPassword, 10);
    } else {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const userF = await UserM.create({
      user,
      password: hashedPassword,
      roleId,
      defaultPassword,
      employeeId,
      customerId
    });

    res.status(201).json(userF);
  }, "No se pudo crear el usuario");

  update = catchAsync(async (req, res) => {
    const { password, ...updates } = req.body;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await UserM.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  }, "No se pudo actualizar el usuario");

  setNewPassword = catchAsync(async (req, res) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Se requiere password." });

    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserM.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
      defaultPassword: null
    }, { new: true });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  }, "No se pudo actualizar el usuario");
}
