const jwt = require("jsonwebtoken");

const tokenKey = "some-random-generated-hash";

const verifyAuthenticated = (req, res, next) => {
  const token = req.headers["token"];

  if (!token) {
    return res.status(403).json({
      error: "A token is required for authentication",
    });
  }

  try {
    const user = jwt.verify(token, tokenKey);
    req.user = user;
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      error: "Invalid Token",
    });
  }
  return next();
};

module.exports = verifyAuthenticated;
