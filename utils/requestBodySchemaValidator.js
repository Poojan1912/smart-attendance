const Joi = require("joi");

// Request Validations
const registerUserRequestSchema = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
  role: Joi.string(),
});

const loginUserRequestSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(15).required(),
});

const generateQRRequestSchema = Joi.object().keys({
  name: Joi.string().required(),
  date: Joi.date().required(),
});

const requestBodySchemaValidator = (schema) => (req, res, next) => {
  const response = schema.validate(req.body);
  if (response.error) {
    res.status(400).json(response.error);
  } else {
    next();
  }
};

module.exports = {
  registerUserRequestSchema,
  loginUserRequestSchema,
  generateQRRequestSchema,
  requestBodySchemaValidator,
};
