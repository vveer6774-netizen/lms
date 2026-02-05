const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const db = require("./db");

const app = express();

/* =======================
   MIDDLEWARE
======================= */

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false
}));

/* =======================
   ROUTES
======================= */

// Default route → Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Register page (GET) – FIX for "Cannot GET /register"
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// LOGIN (POST)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Missing login details");
    }

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error("Login DB error:", err);
            return res.send("Database error");
        }

        if (result.length === 0) {
            return res.send("Invalid email or password");
        }

        req.session.user = result[0].name;
        res.redirect("/dashboard.html");
    });
});

// REGISTER (POST)
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.send("All fields are required");
    }

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], (err) => {
        if (err) {
            console.error("Register DB error:", err);
            return res.send("Email already registered");
        }

        res.redirect("/login.html");
    });
});

// LOGOUT
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

/* =======================
   SERVER START
======================= */

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});