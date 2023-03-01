const mongoose = require("mongoose");
const Book = require("../models/book");
const Member = require("../models/member");
const { borrowBook, bookReturn } = require("../controllers/borrow");

jest.mock("../models/book");
jest.mock("../models/member");

describe("borrowBook()", () => {
  let bookId, memberId;

  beforeAll(async () => {
    // connect to test database
    mongoose.set("strictQuery", true);
    await mongoose.connect("mongodb://localhost:27017/library_test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // tambahkan data buku dan member ke database
    const book = new Book({
      title: "Book Title",
      author: "Book Author",
      isBorrowed: false,
    });
    await book.save();
    bookId = book._id;

    const member = new Member({
      name: "Member Name",
      email: "member@example.com",
      penaltyExpiry: new Date(),
    });
    await member.save();
    memberId = member._id;
  });

  afterAll(async () => {
    // hapus data buku dan member dari database
    await Book.deleteMany({});
    await Member.deleteMany({});

    // disconnect from test database
    await mongoose.connection.close();
  });

  it("should return error if member has already borrowed 2 books", async () => {
    // tambahkan 2 buku yang sedang dipinjam oleh member
    await Book.updateMany(
      { _id: { $in: [bookId, bookId] } },
      { borrowedBy: memberId, isBorrowed: true }
    );

    const req = { body: { borrowedBy: memberId, borrowedBooks: bookId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await borrowBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You have already borrowed the maximum number of books",
    });
  });

  it("should return error if book is not found", async () => {
    const req = {
      body: { borrowedBy: memberId, borrowedBooks: "invalid_book_id" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await borrowBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book not found",
    });
  });

  it("should return error if book is already borrowed", async () => {
    // pinjam buku oleh member lain
    const otherMember = new Member({
      name: "Other Member Name",
      email: "other_member@example.com",
      penaltyExpiry: new Date(),
    });
    await otherMember.save();

    await Book.updateOne(
      { _id: bookId },
      { borrowedBy: otherMember._id, isBorrowed: true }
    );

    const req = { body: { borrowedBy: memberId, borrowedBooks: bookId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await borrowBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You have already borrowed the maximum number of books",
    });
  });
});

describe("bookReturn", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        borrowedBy: "memberId",
        borrowedBooks: "bookId",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 status code with success message if book is returned on time", async () => {
    const book = {
      borrowedDate: new Date(),
      isBorrowed: true,
    };
    Book.findOne.mockResolvedValueOnce(book);

    const result = await bookReturn(req, res, next);

    expect(Book.findOne).toHaveBeenCalledWith({ _id: "bookId" });
    expect(Book.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bookId" },
      {
        $set: {
          borrowedBy: "memberId",
          borrowedBooks: "bookId",
          returnedDate: expect.any(Date),
          isBorrowed: false,
        },
      }
    );
    expect(Member.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully returned books",
      data: {
        bookId: "bookId",
        memberId: "memberId",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 200 status code with success message and set penaltyExpiry for member if book is returned late", async () => {
    const borrowedDate = new Date();
    borrowedDate.setDate(borrowedDate.getDate() - 8);
    const book = {
      borrowedDate,
      isBorrowed: true,
    };
    Book.findOne.mockResolvedValueOnce(book);

    const result = await bookReturn(req, res, next);

    expect(Book.findOne).toHaveBeenCalledWith({ _id: "bookId" });
    expect(Book.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bookId" },
      {
        $set: {
          borrowedBy: "memberId",
          borrowedBooks: "bookId",
          returnedDate: expect.any(Date),
          isBorrowed: false,
        },
      }
    );
    expect(Member.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "memberId" },
      {
        $set: {
          penaltyExpiry: expect.any(String),
        },
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully returned books",
      data: {
        bookId: "bookId",
        memberId: "memberId",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 status code with error message if Book.findOne throws an error", async () => {
    const errorMessage = "Book not found";
    Book.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const result = await bookReturn(req, res, next);

    expect(Book.findOne).toHaveBeenCalledWith({ _id: "bookId" });
    expect(Book.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Member.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 status code with error message if an error occurs", async () => {
    const errorMessage = "An error occurred";
    Book.findOne.mockResolvedValueOnce({});
    Book.findOneAndUpdate.mockRejectedValueOnce(new Error(errorMessage));

    const result = await bookReturn(req, res, next);

    expect(Book.findOne).toHaveBeenCalledWith({ _id: "bookId" });
    expect(Book.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bookId" },
      {
        $set: {
          borrowedBy: "memberId",
          borrowedBooks: "bookId",
          returnedDate: expect.any(Date),
          isBorrowed: false,
        },
      }
    );
    expect(Member.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    expect(next).not.toHaveBeenCalled();
  });
});
