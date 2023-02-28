const Member = require("../models/member");
const Book = require("../models/book");

// const getAllMembersWithBorrowedBooks = async (req, res) => {
//   try {
//     // Find all members
//     const members = await Member.find();

//     // Get number of borrowed books for each member
//     const memberData = await Promise.all(
//       members.map(async (member) => {
//         const borrowedBooks = await Book.find({
//           borrowedBy: member._id,
//           isBorrowed: true,
//         });
//         return { member, borrowedBooks: borrowedBooks.length };
//       })
//     );

//     // Return the result
//     res.status(200).json({ data: memberData });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getAllMembersWithBorrowedBooks = async (req, res) => {
  try {
    // Find all members
    const members = await Member.find();
    const memberData = [];

    // Iterate over each member and get the number of borrowed books
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const borrowedBooks = await Book.find({
        borrowedBy: member._id,
        isBorrowed: true,
      });
      memberData.push({ member, borrowedBooks: borrowedBooks.length });
    }

    // Return the result
    res
      .status(200)
      .json({
        message: "succesfully get member with borrowed the books",
        data: memberData,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { name } = req.body;
    const member = await Member.findOne({ name });

    if (!name) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (member) {
      return res
        .status(400)
        .json({ message: "Member already exist in our system" });
    }
    const newMember = new Member({
      name,
    });
    await newMember.save();
    res.status(200).json({
      message: "Succesfully add new member",
      data: {
        id: newMember._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const { name } = req.body;
    const member = await Member.findOne({ name });

    const updateMember = await Member.updateOne(
      { _id: req.params.id },
      { $set: req.body, updatedAt: new Date() }
    );

    if (!updateMember.modifiedCount && !updateMember.matchedCount) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member) {
      return res
        .status(400)
        .json({ message: "Member already exist in our system" });
    }

    res.status(200).json({
      message: "Succesfully update member",
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const deleteMember = await Member.deleteOne({ _id: req.params.id });

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

module.exports = {
  getAllMembersWithBorrowedBooks,
  addMember,
  updateMember,
  deleteMember,
};
