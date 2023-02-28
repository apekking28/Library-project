const mongoose = require("mongoose");
const { Schema } = mongoose;

const book = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    borrowedBy: {
      type: Schema.Types.ObjectId,
      ref: "member",
      default: null,
    },
    borrowedDate: {
      type: Date,
      default: null,
    },
    returnedDate: {
      type: Date,
      default: null,
    },
    isBorrowed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("book", book);
module.exports = Book;
