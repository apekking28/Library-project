const { Router } = require("express");
const router = Router();
const {
  findBook,
  addBook,
  updateBook,
  deleteBook,
} = require("../controllers/book");
const { borrowBook, bookReturn } = require("../controllers/borrow");

router.get("/books", findBook);

router.post("/books", addBook);

router.post("/books/borrow", borrowBook);

router.post("/books/return", bookReturn);

router.put("/books/:id", updateBook);

router.delete("/books/:id", deleteBook);

module.exports = router;
