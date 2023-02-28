const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const member = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    penaltyExpiry: {
      type: Date,
      default: null,
    },
    borrowedBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: "book",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model("member", member);
module.exports = Member;
