const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "users.json");

function getUsers() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

function saveUsers(users) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

module.exports = { getUsers, saveUsers };
