const { getAllPosts, saveAllPosts } = require("../models/post.model");
const timeAgo = require("../utils/timeAgo");
const generateId = require("../utils/uuid");
const fs = require("fs");
const path = require("path");

/* =======================
   GET ALL POSTS
======================= */
exports.getAllPosts = (req, res) => {
  let posts = getAllPosts().reverse();
  res.render("posts/index", { posts, timeAgo });
};

/* =======================
   NEW POST FORM
======================= */
exports.newPostForm = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");
  res.render("posts/new");
};

/* =======================
   CREATE POST
======================= */
exports.createPost = (req, res) => {
  if (!req.file || !req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();

  posts.push({
    id: generateId(),
    image: req.file.filename,
    caption: req.body.caption,
    likes: 0,
    comments: [],
    createdAt: new Date(),
    userId: req.session.user.id,
    username: req.session.user.username,
  });

  saveAllPosts(posts);
  res.redirect("/posts");
};

/* =======================
   SINGLE POST
======================= */
exports.getSinglePost = (req, res) => {
  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  if (!post) return res.redirect("/posts");

  res.render("posts/show", { post });
};

/* =======================
   EDIT POST (OWNER)
======================= */
exports.editPostForm = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  const userId = req.session.user.id;

  if (!post || String(post.userId) !== String(userId)) {
    return res.redirect("/posts");
  }

  res.render("posts/edit", { post });
};

/* =======================
   UPDATE POST
======================= */
exports.updatePost = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  const userId = req.session.user.id;

  if (!post || String(post.userId) !== String(userId)) {
    return res.redirect("/posts");
  }

  post.caption = req.body.caption;
  saveAllPosts(posts);
  res.redirect(`/posts/${post.id}`);
};

/* =======================
   DELETE POST
======================= */
exports.deletePost = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  const userId = req.session.user.id;

  if (!post || String(post.userId) !== String(userId)) {
    return res.redirect("/posts");
  }

  const imgPath = path.join(__dirname, "..", "public", "uploads", post.image);
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

  const updated = posts.filter((p) => String(p.id) !== String(req.params.id));
  saveAllPosts(updated);
  res.redirect("/posts");
};

/* =======================
   LIKE POST
======================= */
exports.likePost = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));

  if (post) {
    post.likes = (post.likes || 0) + 1;
    saveAllPosts(posts);
  }

  res.redirect(`/posts/${req.params.id}`);
};

/* =======================
   ADD COMMENT
======================= */
exports.addComment = (req, res) => {
  const user = req.session && req.session.user;
  if (!user || user.id == null) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  if (!post) return res.redirect("/posts");

  if (!Array.isArray(post.comments)) post.comments = [];

  post.comments.push({
    id: generateId(),
    text: req.body.text || "",
    createdAt: new Date(),
    userId: user.id,
    username: user.username || "user",
  });

  saveAllPosts(posts);
  res.redirect(`/posts/${post.id}`);
};

/* =======================
   DELETE COMMENT
======================= */
exports.deleteComment = (req, res) => {
  if (!req.session || !req.session.user) return res.redirect("/login");

  const posts = getAllPosts();
  const post = posts.find((p) => String(p.id) === String(req.params.id));
  if (!post) return res.redirect("/posts");

  if (!Array.isArray(post.comments)) return res.redirect(`/posts/${post.id}`);

  const comment = post.comments.find(
    (c) => String(c.id) === String(req.params.cid),
  );
  const userId = req.session.user.id;
  if (!comment || String(comment.userId) !== String(userId)) {
    return res.redirect(`/posts/${post.id}`);
  }

  post.comments = post.comments.filter(
    (c) => String(c.id) !== String(req.params.cid),
  );
  saveAllPosts(posts);
  res.redirect(`/posts/${post.id}`);
};
