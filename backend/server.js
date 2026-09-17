console.log("SERVER FILE LOADED");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;



app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Backend running");
});
const path = require("path");
const USERS_FILE = path.join(__dirname, "user.json");

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, "[]");
    }

    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ADD THIS PART HERE

// Existing routes
app.post("/register", (req, res) => {
    const { name, email, password, grade, school, role } = req.body;

    let users = readUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
        grade,
        school,
        role: "student"
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ message: "User registered successfully" });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    let users = readUsers();

    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", userId: user.id, name: user.name, email: user.email, grade: user.grade, school: user.school, role: user.role || "student", department: user.department, joiningDate: user.joiningDate });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});