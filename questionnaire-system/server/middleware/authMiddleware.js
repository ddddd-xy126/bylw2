import jwt from "jsonwebtoken";
import config from "../config/config.default.js";

export const authRequired = (roles = []) => {
  return (req, res, next) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ message: "未认证" });
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload;
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "权限不足" });
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: "无效的令牌" });
    }
  };
};

export const verifyToken = authRequired();
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "未认证" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "权限不足" });
  next();
};
