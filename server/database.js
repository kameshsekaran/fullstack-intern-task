const Database = require("better-sqlite3");

const db = new Database("templates.db");

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_id INTEGER NOT NULL,
        UNIQUE(user_id, template_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(template_id) REFERENCES templates(id) ON DELETE CASCADE
    );
`);

const count = db
    .prepare("SELECT COUNT(*) AS count FROM templates")
    .get().count;

if (count === 0) {
    const insert = db.prepare(`
        INSERT INTO templates
        (name, description, thumbnail_url, category)
        VALUES (?, ?, ?, ?)
    `);

    const templates = [
        [
            "Portfolio Website",
            "Showcase your projects and skills.",
            "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600",
            "Portfolio"
        ],
        [
            "E-commerce Store",
            "Create a beautiful online store.",
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
            "E-commerce"
        ],
        [
            "SaaS Landing Page",
            "Promote your software product.",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
            "Business"
        ],
        [
            "Blog Website",
            "Share articles and stories.",
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600",
            "Blog"
        ],
        [
            "Admin Dashboard",
            "Manage your business data.",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            "Dashboard"
        ]
    ];

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insert.run(...item);
        }
    });

    insertMany(templates);
}

module.exports = db;
