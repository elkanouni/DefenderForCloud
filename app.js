const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.urlencoded({ extended: true }));

// ❌ Hardcoded secret
const API_KEY = "12345-SECRET-KEY";

// ❌ Base de données sans protection
const db = new sqlite3.Database(':memory:');

// Création table
db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'password123')");
});

// ❌ SQL Injection
app.get('/user', (req, res) => {
  const id = req.query.id;

  const query = "SELECT * FROM users WHERE id = " + id; // VULN

  db.all(query, [], (err, rows) => {
    res.send(rows);
  });
});

// ❌ XSS
app.get('/search', (req, res) => {
  const term = req.query.q;
  res.send("<h1>Résultat: " + term + "</h1>"); // VULN
});

// ❌ Command Injection
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec("ping " + host, (err, stdout) => {
    res.send(stdout);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
