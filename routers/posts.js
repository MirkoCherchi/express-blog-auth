// routers/posts.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/posts");
const multer = require("multer");
const { authenticateWithJWT, isAdmin } = require("../controllers/auth");

const uploader = multer({ dest: "public/" });

router.get("/", postController.index);
router.post(
  "/",
  authenticateWithJWT,
  uploader.single("image"),
  postController.create
);
router.get("/:slug", postController.show);
router.get("/:slug/download", postController.download);
router.delete("/:slug", authenticateWithJWT, isAdmin, postController.destroy);

module.exports = router;
