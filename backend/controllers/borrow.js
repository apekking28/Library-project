const Member = require("../models/member");
const Book = require("../models/book");

// const borrowedBook = async (req, res) => {
//   try {
//     const { borrowedBy, borrowedBooks } = req.body;
//     const book = await Book.findOne({ _id: borrowedBooks });
//     const member = await Member.findOne({ _id: borrowedBy });

//     if (!borrowedBy || !borrowedBooks) {
//       return res.status(400).json({ message: "Please fill in all fields" });
//     }

//     if (book.isBorrowed === true) {
//       return res.status(400).json({ message: "Book has been borrowed" });
//     }

//     const currentDate = new Date();

//     if (currentDate < member.penaltyExpiry) {
//       return res.status(400).json({ message: "Your account is suspended" });
//     }

//     const bookBorrowing = await Book.findOneAndUpdate(
//       { _id: req.body.borrowedBooks },
//       {
//         $set: {
//           borrowedBy,
//           borrowedDate: new Date(),
//           isBorrowed: true,
//         },
//       }
//     );

//     res.status(200).json({
//       message: "Successfully lending books",
//       data: {
//         bookId: borrowedBooks,
//         memberId: borrowedBy,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const borrowBook = async (req, res) => {
  try {
    const { borrowedBy, borrowedBooks } = req.body;

    const borrowedBooksCount = await Book.countDocuments({
      borrowedBy: borrowedBy,
      isBorrowed: true,
    });

    // Check if member has already borrowed maximum of 2 books
    if (borrowedBooksCount >= 2) {
      return res.status(400).json({
        message: "You have already borrowed the maximum number of books",
      });
    }

    const book = await Book.findOne({ _id: borrowedBooks });

    // Check if book is available to be borrowed
    if (!book) {
      return res.status(400).json({ message: "Book not found" });
    } else if (book.isBorrowed === true) {
      return res.status(400).json({ message: "Book has been borrowed" });
    }

    const currentDate = new Date();
    const member = await Member.findOne({ _id: borrowedBy });

    // Check if member is not currently serving penalty
    if (currentDate < member.penaltyExpiry) {
      return res.status(400).json({ message: "Your account is suspended" });
    }

    // Update book status
    const bookBorrowing = await Book.findOneAndUpdate(
      { _id: borrowedBooks },
      {
        $set: {
          borrowedBy,
          borrowedDate: new Date(),
          isBorrowed: true,
        },
      }
    );

    res.status(200).json({
      message: "Successfully lending books",
      data: {
        bookId: borrowedBooks,
        memberId: borrowedBy,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const bookReturn = async (req, res) => {
//   try {
//     const { borrowedBy, borrowedBooks } = req.body;
//     const book = await Book.findOne({ _id: borrowedBooks });

//     //  date of book borrowing
//     const borrowedDate = book.borrowedDate;

//     // date of returning the book (max 7 days)
//     const pinaltyDate = new Date(borrowedDate);
//     pinaltyDate.setDate(borrowedDate.getDate() + 7);

//     if (borrowedDate < pinaltyDate) {
//       // date the account was deferred (max & min === 3 days)
//       const today = new Date();
//       const isoDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
//       const penaltyExpire = isoDate.toISOString();

//       const pinaltyMember = await Member.findOneAndUpdate(
//         { _id: req.body.borrowedBy },
//         { $set: { penaltyExpiry: penaltyExpire } }
//       );
//     }

//     // find and then update Book
//     const retrunBook = await Book.findOneAndUpdate(
//       { _id: req.body.borrowedBooks },
//       {
//         $set: {
//           borrowedBy,
//           borrowedBooks,
//           returnedDate: new Date(),
//           isBorrowed: false,
//         },
//       }
//     );
//     res.status(200).json({
//       message: "successfully returned books",
//       data: {
//         bookId: borrowedBooks,
//         memberId: borrowedBy,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const bookReturn = async (req, res) => {
  try {
    const { borrowedBy, borrowedBooks } = req.body;
    const book = await Book.findOne({ _id: borrowedBooks });

    // date of book borrowing
    const borrowedDate = book.borrowedDate;

    // date of returning the book (max 7 days)
    const penaltyDate = new Date(borrowedDate);
    penaltyDate.setDate(borrowedDate.getDate() + 7);

    if (borrowedDate < penaltyDate) {
      // date the account was deferred (max & min === 3 days)
      const today = new Date();
      const isoDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      const penaltyExpire = isoDate.toISOString();

      const penaltyMember = await Member.findOneAndUpdate(
        { _id: req.body.borrowedBy },
        { $set: { penaltyExpiry: penaltyExpire } }
      );
    }

    // find and then update Book
    const returnBook = await Book.findOneAndUpdate(
      { _id: req.body.borrowedBooks },
      {
        $set: {
          borrowedBy,
          borrowedBooks,
          returnedDate: new Date(),
          isBorrowed: false,
        },
      }
    );

    res.status(200).json({
      message: "Successfully returned books",
      data: {
        bookId: borrowedBooks,
        memberId: borrowedBy,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowBook, bookReturn };
