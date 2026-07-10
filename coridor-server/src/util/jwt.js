import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function decodeInteractiveToken(token) {
  const decoded = jwt.verify(token, config.sep24InteractiveJwtSecret);
  return {
    transactionId: decoded.jti,
    exp: decoded.exp,
    sub: decoded.sub,
    data: decoded.data || {},
  };
}

export function decodeMoreInfoToken(token) {
  const decoded = jwt.verify(token, config.sep24MoreInfoJwtSecret);
  return {
    transactionId: decoded.jti,
    exp: decoded.exp,
    sub: decoded.sub,
    lang: decoded.data?.lang || "id",
  };
}

export function isTokenExpired(exp) {
  return exp * 1000 < Date.now();
}
