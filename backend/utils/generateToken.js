import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userOrId) => {
  const userId = userOrId && userOrId._id ? userOrId._id : userOrId;
  const role = userOrId && userOrId.role ? userOrId.role : undefined;

  const payload = { id: userId };
  if (role) payload.role = role;

  const token = jwt.sign(payload, process.env.JWT_SECRET || "factohrsecretkey", {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from reading cookie
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? "none" : "lax", // Cross-site support in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);
  return token;
};