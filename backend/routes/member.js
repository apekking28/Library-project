const { Router } = require("express");
const router = Router();
const {
  getAllMembersWithBorrowedBooks,
  addMember,
  updateMember,
  deleteMember,
} = require("../controllers/member");

router.get("/members", getAllMembersWithBorrowedBooks);

router.post("/members", addMember);

router.put("/members/:id", updateMember);

router.delete("/members/:id", deleteMember);

module.exports = router;
