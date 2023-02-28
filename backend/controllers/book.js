const Book = require("../models/book");

const findBook = async (req, res) => {
  try {
    const book = await Book.find({ isBorrowed: false });

    res.status(200).json({
      message:
        "successfully obtained all book data that has not been loaned out.",
      total: book.length,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author } = req.body;
    const book = await Book.findOne({ title });

    if (!title || !author) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (book) {
      return res
        .status(400)
        .json({ message: "Book already exist in our system" });
    }

    const newBook = new Book({
      title,
      author,
    });

    await newBook.save();

    res.status(200).json({
      message: "Succesfully add new book",
      data: {
        id: newBook._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { title } = req.body;
    const book = await Book.findOne({ title });

    const updateBook = await Book.updateOne(
      { _id: req.params.id },
      { $set: req.body, updatedAt: new Date() }
    );

    if (!updateBook.modifiedCount && !updateBook.matchedCount) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book) {
      return res
        .status(400)
        .json({ message: "Book already exist in our system" });
    }

    res.status(200).json({
      message: "Succesfully update book",
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const deleteMember = await Book.deleteOne({ _id: req.params.id });

    if (!deleteMember.deletedCount) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).json({
      message: "Succesfully delete book",
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { findBook, addBook, updateBook, deleteBook };
