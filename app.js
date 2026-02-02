require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const methodOverride = require("method-override");
const flash = require("connect-flash");

const postroutes = require("./routes/post.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const port = process.env.PORT || 8080;

/* =======================
   VIEW ENGINE
======================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =======================
   MIDDLEWARES
======================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// Support _method in query (reliable) or body so POST forms can act as DELETE/PUT
app.use(
  methodOverride((req) => {
    if (req.query && typeof req.query._method === "string")
      return req.query._method;
    if (req.body && typeof req.body._method === "string")
      return req.body._method;
  }),
);

/* =======================
   SESSION (file store so session persists across requests / restarts)
======================= */
app.use(
  session({
    store: new FileStore({ path: path.join(__dirname, "sessions") }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

/* =======================
   FLASH (AFTER SESSION)
======================= */
app.use(flash());

/* =======================
   GLOBAL FLASH VARIABLES
======================= */
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.user || null;
  next();
});

/* =======================
   ROUTES (LAST)
======================= */
app.use(authRoutes); // /login /signup /logout
app.use("/posts", postroutes);

/* =======================
   SERVER
======================= */
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
});
