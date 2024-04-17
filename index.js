const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const {
  requestBodySchemaValidator,
  registerUserRequestSchema,
  loginUserRequestSchema,
  generateQRRequestSchema,
} = require("./utils/requestBodySchemaValidator");
const verifyAuthenticated = require("./utils/verifyAuthenticated");
const { User } = require("./models/user");
const Lecture = require("./models/lecture");

const app = express();
const port = process.env.NODE_ENV || 3000;
const tokenKey = "some-random-generated-hash";
const databaseURI =
  process.env.DATABASE_URI || "mongodb://localhost:27017/smart-attendance";

mongoose.connect(databaseURI);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};

app.use(cors(corsOptions));

app.post(
  "/auth/register",
  requestBodySchemaValidator(registerUserRequestSchema),
  async (req, res) => {
    const { name, email, password, role } = req.body;

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).json({
        error: "User Already Exist. Please Login",
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      role: role === "Teacher" ? "Teacher" : "Student",
    });

    // Create token
    const token = jwt.sign({ user_id: user._id, email }, tokenKey, {});

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: token,
    });
  }
);

app.post(
  "/auth/login",
  requestBodySchemaValidator(loginUserRequestSchema),
  async (req, res) => {
    const { email, password } = req.body;

    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email, role: user.role },
        tokenKey
      );

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      });
    } else {
      res.status(400).json({
        error: "Invalid Credentials",
      });
    }
  }
);

app.post(
  "/teachers/generate-qr",
  verifyAuthenticated,
  requestBodySchemaValidator(generateQRRequestSchema),
  async (req, res) => {
    const { name, date } = req.body;

    const lecture = await Lecture.create({
      name,
      date,
      teacherId: req.user.user_id,
      students: [],
    });

    res.json(lecture);
  }
);

app.post("/students/:lectureId", verifyAuthenticated, async (req, res) => {
  const lecture = await Lecture.findOne({ _id: req.params.lectureId });
  if (!lecture) {
    res.status(400).json({
      error: "Invalid Lecture Id",
    });
  }

  lecture.students.push(req.user.user_id);
  await lecture.save();

  res.json({ ok: true });
});

app.get("/lectures/mine", verifyAuthenticated, async (req, res) => {
  const lectures = await Lecture.find({
    students: { $all: [req.user.user_id] },
  });
  res.json(lectures);
});

app.get("/lectures/:lectureId", verifyAuthenticated, async (req, res) => {
  const lecture = await Lecture.findOne({ _id: req.params.lectureId });
  if (!lecture) {
    res.status(400).json({
      error: "Invalid Lecture Id",
    });
  }

  res.json(lecture);
});
app.listen(port, () => console.log(`Server running in ${port}`));
