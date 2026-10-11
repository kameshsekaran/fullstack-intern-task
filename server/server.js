require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET;

if (!SECRET || SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {
        req.user = jwt.verify(header.split(" ")[1], SECRET);
        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Register
app.post("/api/auth/register", (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Enter a valid name and email. Password must have at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(normalizedEmail);

        if (existing) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(name.trim(), normalizedEmail, hashedPassword);

        res.status(201).json({
            message: "Registration successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// Login
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email.trim().toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "2h" }
    );

    res.json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// List templates
app.get("/api/templates", (req, res) => {
    const templates = db.prepare(
        "SELECT * FROM templates ORDER BY id"
    ).all();

    res.json(templates);
});

// Get template details
app.get("/api/templates/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid template ID"
        });
    }

    const template = db.prepare(
        "SELECT * FROM templates WHERE id = ?"
    ).get(id);

    if (!template) {
        return res.status(404).json({
            message: "Template not found"
        });
    }

    res.json(template);
});

// Add favorite
app.post(
    "/api/favorites/:templateId",
    authenticateToken,
    (req, res) => {
        const templateId = Number(req.params.templateId);

        if (!Number.isInteger(templateId) || templateId <= 0) {
            return res.status(400).json({
                message: "Invalid template ID"
            });
        }

        const template = db.prepare(
            "SELECT id FROM templates WHERE id = ?"
        ).get(templateId);

        if (!template) {
            return res.status(404).json({
                message: "Template not found"
            });
        }

        db.prepare(`
            INSERT OR IGNORE INTO favorites (user_id, template_id)
            VALUES (?, ?)
        `).run(req.user.id, templateId);

        res.json({
            message: "Template added to favorites"
        });
    }
);

// Get current user's favorites
app.get("/api/favorites", authenticateToken, (req, res) => {
    const favorites = db.prepare(`
        SELECT t.*
        FROM templates t
        JOIN favorites f ON f.template_id = t.id
        WHERE f.user_id = ?
        ORDER BY f.id DESC
    `).all(req.user.id);

    res.json(favorites);
});

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "Mini SaaS Template Store API is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
