const { getUsers, saveUsers } = require("../data/users");
const bcrypt = require("bcrypt");

/* =======================
   SIGNUP PAGE
======================= */
exports.getSignup = (req, res) => {
  res.render("auth/signup");
};

/* =======================
   SIGNUP LOGIC
======================= */
exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🔒 validation
    if (!username || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/signup");
    }

    const users = getUsers();

    // 🔁 email already exists (case-insensitive)
    const existingUser = users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/signup");
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
    };

    users.push(newUser);
    saveUsers(users);

    req.flash("success", "Signup successful! Please login.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/signup");
  }
};

/* =======================
   LOGIN PAGE
======================= */
exports.getLogin = (req, res) => {
  res.render("auth/login");
};

/* =======================
   LOGIN LOGIC
======================= */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔒 validation
    if (!email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    const users = getUsers();

    // 🔁 find user (case-insensitive)
    const user = users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // ✅ store only serializable values (numbers/strings) so session persists
    req.session.user = {
      id: user.id,
      username: String(user.username),
      email: String(user.email),
    };

    req.flash("success", "Login successful!");
    // ✅ persist session to store BEFORE sending redirect (avoids lost session)
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/login");
      }
      res.redirect("/posts");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/login");
  }
};

/* =======================
   LOGOUT
======================= */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.redirect("/posts");
    }
    res.redirect("/login");
  });
};
