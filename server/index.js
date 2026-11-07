require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const users = [
  {
    id: 1,
    name: "Demo Student",
    email: "student@campusconnect.test",
    passwordHash: bcrypt.hashSync("Campus26", 10),
  },
];

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/v1/sessions", (req, res) => {
  const { email, password } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password.trim() ||
    !emailRegex.test(email.trim())
  ) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});