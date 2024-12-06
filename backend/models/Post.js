const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
   email: {type:String, required: true},
    post: { type: String, required: true },
  },
  { collection:'posts', timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
