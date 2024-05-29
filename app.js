const express = require("express");
const app = express();
const port = 3000;
const postRouter = require("./routers/posts");
const posts = require("./db/db.json");
const routersLogger = require("./middlewares/routersLogger.js");
const errorsFormatter = require("./middlewares/errorsFormatter.js");
const routesNotFound = require("./middlewares/routersNotFound.js");
const morgan = require("morgan");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routersLogger);

app.get("/", (req, res) => {
  res.send(`<h1>Benvenuto nel mio Blog!</h1>`);
});

app.use("/posts", postRouter);

app.use(routesNotFound);

app.use(errorsFormatter);

app.listen(port, () => {
  console.log(`Server http://localhost:${port}`);
});
