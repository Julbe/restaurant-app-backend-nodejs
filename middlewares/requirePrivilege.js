

export const requirePrivilege = (privilegeName) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.privileges) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Validar privilegio
    if (!user.privileges[privilegeName]) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};
