const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let matches = users.filter((user) => user.username === username);
  return matches.length > 0;
};

const authenticatedUser = (username, password) => {
  let matches = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matches.length > 0;
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

  let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "User logged in successfully", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    review: books[isbn].reviews
  });
});

// Delete a book review (added by this file since it was missing from the template)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "No review found for this user to delete" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;