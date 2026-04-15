const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');

const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔥 Secret critique (HIGH)
const JWT_SECRET = "SUPER_SECRET_PROD_KEY_123456";

// 🔥 DB avec données sensibles
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT, role TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'Admin123!', 'admin')");
});

// 🔥 AUTH BYPASS (SQL Injection → HIGH)
app.get('/login', (req, res) => {
  const user = req.query.user;
  const pass = req.query.pass;

  const query = `SELECT * FROM users WHERE username='${user}' AND password='${pass}'`;

  db.all(query, [], (err, rows) => {
    if (rows.length > 0) {
      res.send("✅ Logged in as " + rows[0].role);
    } else {
      res.send("❌ Access denied");
    }
  });
});

// 🔥 RCE (Command Injection → HIGH)
app.get('/exec', (req, res) => {
  const cmd = req.query.cmd;

  exec(cmd, (err, stdout, stderr) => {
    res.send(stdout + stderr);
  });
});

// 🔥 Dangerous eval (HIGH direct)
app.get('/eval', (req, res) => {
  const code = req.query.code;
  const result = eval(code);
  res.send("Result: " + result);
});

// 🔥 XSS avec session simulation
app.get('/profile', (req, res) => {
  const name = req.query.name;

  res.send(`
    <html>
      <body>
        <h1>Welcome ${name}</h1>
        <script>
          document.cookie="session=admin-token";
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("🔥 Vulnerable app running on port 3000");
});
