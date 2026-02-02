const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const upload = require("../utils/upload");
const isLoggedIn = require("../middleware/isLoggedIn");

// all posts
router.get("/", postController.getAllPosts);

// new post
router.get("/new", isLoggedIn, postController.newPostForm);
router.post("/", isLoggedIn, upload.single("image"), postController.createPost);

// like
router.post("/:id/like", isLoggedIn, postController.likePost);

// edit / delete / comment (MUST be before get("/:id") so /posts/123/edit matches edit, not single post)
router.get("/:id/edit", isLoggedIn, postController.editPostForm);
router.put("/:id", isLoggedIn, postController.updatePost);
router.delete("/:id", isLoggedIn, postController.deletePost);
router.post("/:id/comment", isLoggedIn, postController.addComment);
router.delete("/:id/comment/:cid", isLoggedIn, postController.deleteComment);

// single post (LAST so it does not catch /posts/123/edit or /posts/123/comment)
router.get("/:id", postController.getSinglePost);

module.exports = router;
