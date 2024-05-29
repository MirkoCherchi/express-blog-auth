const jwt = require("jsonwebtoken");
require("dotenv").config();
const users = require("../db/users.json");

const generateToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

const authenticateWithJWT = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send("Hai bisogno di autenticarti.");
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send(err);
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const { username } = req.user;
  const user = users.find((u) => u.username === username);
  if (!user || !user.admin) {
    return res.status(403).send("Non sei autorizzato, devi essere admin");
  }
  next();
};

const login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(404).send("Credenziali errate.");
  }

  const token = generateToken(user);
  res.json({ token });
};

module.exports = {
  generateToken,
  authenticateWithJWT,
  isAdmin,
  login,
};
