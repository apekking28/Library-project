const {
  getAllMembersWithBorrowedBooks,
  addMember,
  updateMember,
  deleteMember,
} = require("../controllers/member");
const Member = require("../models/member");
const Book = require("../models/book");

describe("getAllMembersWithBorrowedBooks", () => {
  it("should return members with their number of borrowed books", async () => {
    // Mock data
    const members = [
      { _id: "member-1" },
      { _id: "member-2" },
      { _id: "member-3" },
    ];
    const books = [
      { borrowedBy: "member-1", isBorrowed: true },
      { borrowedBy: "member-1", isBorrowed: true },
      { borrowedBy: "member-2", isBorrowed: true },
      { borrowedBy: "member-2", isBorrowed: false },
      { borrowedBy: "member-3", isBorrowed: true },
      { borrowedBy: "other-member", isBorrowed: true },
    ];

    // Mock database queries
    Member.find = jest.fn().mockResolvedValue(members);
    Book.find = jest.fn().mockImplementation(({ borrowedBy, isBorrowed }) => {
      return Promise.resolve(
        books.filter(
          (book) =>
            book.borrowedBy === borrowedBy && book.isBorrowed === isBorrowed
        )
      );
    });

    // Expected result
    const expected = {
      message: "succesfully get member with borrowed the books",
      data: [
        { member: members[0], borrowedBooks: 2 },
        { member: members[1], borrowedBooks: 1 },
        { member: members[2], borrowedBooks: 1 },
      ],
    };

    // Call the function
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await getAllMembersWithBorrowedBooks(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expected);
    expect(Member.find).toHaveBeenCalled();
    expect(Book.find).toHaveBeenCalledTimes(3);
    expect(Book.find).toHaveBeenCalledWith({
      borrowedBy: "member-1",
      isBorrowed: true,
    });
    expect(Book.find).toHaveBeenCalledWith({
      borrowedBy: "member-2",
      isBorrowed: true,
    });
    expect(Book.find).toHaveBeenCalledWith({
      borrowedBy: "member-3",
      isBorrowed: true,
    });
  });

  it("should handle errors", async () => {
    // Mock database query that throws an error
    jest.spyOn(Member, "find").mockRejectedValue(new Error("Database error"));
    jest.spyOn(Book, "find").mockRejectedValue(new Error("Database error"));

    // Call the function
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await getAllMembersWithBorrowedBooks(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    expect(Member.find).toHaveBeenCalled();
    expect(Book.find).not.toHaveBeenCalled();
  });
});

describe("addMember", () => {
  it("should add a new member to the database", async () => {
    // Mock request and response objects
    const req = { body: { name: "John Doe" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Member.findOne method to return null
    Member.findOne = jest.fn().mockResolvedValue(null);

    // Mock Member.save method
    const save = jest.fn().mockResolvedValue({ _id: "member-1" });
    jest.spyOn(Member.prototype, "save").mockImplementation(save);

    // Call the function
    await addMember(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Succesfully add new member",
      data: { id: "member-1" },
    });
    expect(Member.findOne).toHaveBeenCalledWith({ name: "John Doe" });
    expect(save).toHaveBeenCalled();
  });

  it("should return an error if a member with the same name already exists", async () => {
    // Mock request and response objects
    const req = { body: { name: "John Doe" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Member.findOne method to return an existing member
    Member.findOne = jest.fn().mockResolvedValue({ _id: "member-1" });

    // Call the function
    await addMember(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Member already exist in our system",
    });
    expect(Member.findOne).toHaveBeenCalledWith({ name: "John Doe" });
  });

  it("should return an error if a name is not provided", async () => {
    // Mock request and response objects
    const req = { body: { name: "" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function
    await addMember(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please fill in all fields",
    });
    expect(Member.findOne).not.toHaveBeenCalled();
  });

  it("should return an error if an error occurs while saving the member", async () => {
    // Mock request and response objects
    const req = { body: { name: "John Doe" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Member.findOne method to return null
    Member.findOne = jest.fn().mockResolvedValue(null);

    // Mock Member.save method to throw an error
    jest.spyOn(Member.prototype, "save").mockImplementation(() => {
      throw new Error("Database error");
    });

    // Call the function
    await addMember(req, res);

    // Verify the result
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    expect(Member.findOne).toHaveBeenCalledWith({ name: "John Doe" });
  });
});

describe("updateMember", () => {
  it("should update a member", async () => {
    const member = new Member({ name: "John" });
    await member.save();

    const updateMemberRequest = {
      body: {
        name: "Jane",
      },
      params: {
        id: member._id,
      },
    };

    const updateMemberResponse = {
      message: "Succesfully update member",
      data: {
        id: member._id,
      },
    };

    const updatedMember = await updateMember(updateMemberRequest, {});
    expect(updatedMember.status).toEqual(200);
    expect(updatedMember.json()).toEqual(updateMemberResponse);
  });

  it("should return 404 if member not found", async () => {
    const updateMemberRequest = {
      body: {
        name: "Jane",
      },
      params: {
        id: "nonexistent-id",
      },
    };

    const updateMemberResponse = {
      message: "Member not found",
    };

    const updatedMember = await updateMember(updateMemberRequest, {});
    expect(updatedMember.status).toEqual(404);
    expect(updatedMember.json()).toEqual(updateMemberResponse);
  });

  it("should return 400 if member name already exist", async () => {
    const member1 = new Member({ name: "John" });
    await member1.save();

    const member2 = new Member({ name: "Jane" });
    await member2.save();

    const updateMemberRequest = {
      body: {
        name: "Jane",
      },
      params: {
        id: member1._id,
      },
    };

    const updateMemberResponse = {
      message: "Member already exist in our system",
    };

    const updatedMember = await updateMember(updateMemberRequest, {});
    expect(updatedMember.status).toEqual(400);
    expect(updatedMember.json()).toEqual(updateMemberResponse);
  });
});

describe("deleteMember function", () => {
  let connection;
  let db;

  before(async () => {
    connection = await mongoose.connect(
      "mongodb://localhost:27017/library_test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    db = connection.connection.db;
  });

  after(async () => {
    await connection.close();
    await db.dropDatabase();
  });

  it("should return 404 if member is not found", async () => {
    const req = { params: { id: "nonexistentid" } };
    const res = {
      status: function (statusCode) {
        assert.strictEqual(statusCode, 404);
        return this;
      },
      json: function (data) {
        assert.deepStrictEqual(data, { message: "Member not found" });
      },
    };

    await deleteMember(req, res);
  });

  it("should delete the member", async () => {
    const newMember = await Member.create({ name: "John Doe" });
    const req = { params: { id: newMember._id.toString() } };
    const res = {
      status: function (statusCode) {
        assert.strictEqual(statusCode, 200);
        return this;
      },
      json: function (data) {
        assert.deepStrictEqual(data, {
          message: "Succesfully delete book",
          data: { id: newMember._id.toString() },
        });
      },
    };

    await deleteMember(req, res);

    const deletedMember = await Member.findById(newMember._id);
    assert.strictEqual(deletedMember, null);
  });
});
