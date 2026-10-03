import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "factohrsecretkey", {
    expiresIn: "7d",
  });

  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from reading cookie
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    sameSite: "lax", // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);
  return token;
};