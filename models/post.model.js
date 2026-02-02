const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "data", "posts.json");

function getAllPosts() {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function saveAllPosts(posts) {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
}

module.exports = {
  getAllPosts,
  saveAllPosts,
};
