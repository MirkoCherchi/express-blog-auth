const express = require("express");
const app = express();
const port = 3000;
const postRouter = require("./routers/posts");
const authRouter = require("./routers/auth");
const routersLogger = require("./middlewares/routersLogger");
const errorsFormatter = require("./middlewares/errorsFormatter");
const routesNotFound = require("./middlewares/routersNotFound");
const morgan = require("morgan");
const { authenticateWithJWT } = require("./controllers/auth");

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routersLogger);

app.get("/", (req, res) => {
  res.send(`<h1>Benvenuto nel mio Blog!</h1>`);
});
app.use(authenticateWithJWT);
app.use("/posts", postRouter);

app.use("/auth", authRouter);

app.use(routesNotFound);
app.use(errorsFormatter);

app.listen(port, () => {
  console.log(`Server http://localhost:${port}`);
});
