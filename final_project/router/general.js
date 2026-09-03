const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let matchingBooks = [];
  Object.keys(books).forEach((key) => {
    if (books[key].author === author) {
      matchingBooks.push(books[key]);
    }
  });
  res.send(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let matchingBooks = [];
  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      matchingBooks.push(books[key]);
    }
  });
  res.send(matchingBooks);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.send(books[isbn].reviews);
});

// ---- Task 10-13: Same operations implemented with Axios (Promise / async-await) ----

// Task 10: Get all books – async/await
async function getAllBooks() {
  try {
    const response = await axios.get("http://localhost:5000/");
    console.log("Books retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error retrieving books:", error.message);
  }
}

// Task 11: Search by ISBN – Promises
function getBookByISBN(isbn) {
  return axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      if (response.data && Object.keys(response.data).length > 0) {
        console.log("Book found:", response.data);
      } else {
        console.log(`No book found for ISBN ${isbn}`);
      }
      return response.data;
    })
    .catch((error) => console.error("Error retrieving book by ISBN:", error.message));
}

// Task 12: Search by author – async/await
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    if (response.data && response.data.length > 0) {
      console.log(`Books found for author "${author}":`, response.data);
    } else {
      console.log(`No books found for author "${author}"`);
    }
    return response.data;
  } catch (error) {
    console.error("Error retrieving books by author:", error.message);
  }
}

// Task 13: Search by title – async/await
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    if (response.data && response.data.length > 0) {
      console.log(`Books found for title "${title}":`, response.data);
    } else {
      console.log(`No books found for title "${title}"`);
    }
    return response.data;
  } catch (error) {
    console.error("Error retrieving books by title:", error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;