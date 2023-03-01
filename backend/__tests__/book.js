const Book = require("../models/book");
const {
  findBook,
  addBook,
  updateBook,
  deleteBook,
} = require("../controllers/book");

jest.mock("../models/book");

describe("findBook", () => {
  it("should return all books that are not borrowed", async () => {
    const mockBooks = [
      { title: "Book 1", isBorrowed: false },
      { title: "Book 2", isBorrowed: false },
    ];
    Book.find.mockResolvedValue(mockBooks);

    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await findBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message:
        "successfully obtained all book data that has not been loaned out.",
      total: mockBooks.length,
      data: mockBooks,
    });
  });

  it("should return an error response if Book.find() throws an error", async () => {
    const mockError = new Error("Failed to fetch books.");
    Book.find.mockRejectedValue(mockError);

    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await findBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: mockError.message });
  });
});

describe("addBook", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a new book and return its ID", async () => {
    const mockReq = {
      body: {
        title: "New Book",
        author: "John Doe",
      },
    };
    const mockBook = {
      _id: "61074e936d7b98002a857a38",
      title: "New Book",
      author: "John Doe",
      save: jest.fn(),
    };
    const saveSpy = jest.spyOn(mockBook, "save");
    Book.findOne.mockResolvedValue(null);
    Book.mockReturnValueOnce(mockBook);

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBook(mockReq, mockRes);

    expect(Book.findOne).toHaveBeenCalledWith({ title: "New Book" });
    expect(Book).toHaveBeenCalledWith({
      title: "New Book",
      author: "John Doe",
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Succesfully add new book",
      data: {
        id: mockBook._id,
      },
    });
  });

  it("should return an error response if title or author is missing", async () => {
    const mockReq = {
      body: {
        title: "",
        author: "John Doe",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Please fill in all fields",
    });
  });

  it("should return an error response if the book already exists", async () => {
    const mockReq = {
      body: {
        title: "Existing Book",
        author: "Jane Doe",
      },
    };
    const mockBook = {
      _id: "61074e936d7b98002a857a38",
      title: "Existing Book",
      author: "Jane Doe",
    };
    Book.findOne.mockResolvedValue(mockBook);
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Book already exist in our system",
    });
  });

  it("should return an error response if Book.findOne() throws an error", async () => {
    const mockReq = {
      body: {
        title: "New Book",
        author: "John Doe",
      },
    };
    const mockError = new Error("Something went wrong");
    Book.findOne.mockRejectedValue(mockError);
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: mockError.message,
    });
  });
});

describe("updateBook", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "61074e936d7b98002a857a38" },
      body: { title: "New Title" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should update an existing book and return its ID", async () => {
    const mockBook = {
      _id: "61074e936d7b98002a857a38",
      title: "Old Title",
      author: "Author",
    };
    jest.spyOn(Book, "findOne").mockResolvedValue(mockBook);
    jest
      .spyOn(Book, "updateOne")
      .mockResolvedValue({ nModified: 1, nMatched: 1 });

    await updateBook(mockReq, mockRes);

    expect(Book.findOne).toHaveBeenCalledWith({ _id: mockReq.params.id });
    expect(Book.updateOne).toHaveBeenCalledWith(
      { _id: mockReq.params.id },
      { $set: mockReq.body, updatedAt: expect.any(Date) }
    );
    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.json).toHaveBeenCalledWith();
  });

  it("should return an error response if the book is not found", async () => {
    jest.spyOn(Book, "findOne").mockResolvedValue(null);
    jest
      .spyOn(Book, "updateOne")
      .mockResolvedValue({ nModified: 0, nMatched: 0 });

    await updateBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  it("should return an error response if the new title is already in use", async () => {
    const mockBook = {
      _id: "61074e936d7b98002a857a38",
      title: "Old Title",
      author: "Author",
    };
    jest.spyOn(Book, "findOne").mockResolvedValue(mockBook);

    await updateBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Book already exist in our system",
    });
  });

  it("should return an error response if Book.updateOne() throws an error", async () => {
    const mockError = new Error("Failed to update book");
    jest.spyOn(Book, "findOne").mockResolvedValue(null);
    jest.spyOn(Book, "updateOne").mockRejectedValue(mockError);

    await updateBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: mockError.message });
  });
});

describe("deleteBook", () => {
  it("should delete a book and return success message", async () => {
    const book = {
      _id: "1",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
    };

    const req = { params: { id: book._id } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the deleteOne method of the Book model to return a deletedCount of 1
    Book.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    await deleteBook(req, res);

    expect(Book.deleteOne).toHaveBeenCalledWith({ _id: book._id });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully delete book",
      data: {
        id: book._id,
      },
    });
  });

  it("should return 404 if book is not found", async () => {
    const req = { params: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the deleteOne method of the Book model to return a deletedCount of 0
    Book.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

    await deleteBook(req, res);

    expect(Book.deleteOne).toHaveBeenCalledWith({ _id: "1" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Member not found" });
  });

  it("should return 500 and error message if an error occurs", async () => {
    const req = { params: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the deleteOne method of the Book model to throw an error
    const errorMessage = "Database error";
    Book.deleteOne = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await deleteBook(req, res);

    expect(Book.deleteOne).toHaveBeenCalledWith({ _id: "1" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
