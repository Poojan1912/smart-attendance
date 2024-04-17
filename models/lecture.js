const mongoose = require("mongoose");

// Mongoose
const lectureSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;
