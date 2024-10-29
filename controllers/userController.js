const db = require("../db/queries");
const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const genPassword = require("../config/password-utils").genPassword;
const passport = require("passport");

exports.PostRegister = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Passwords must be at least 6 characters long."),
  body("firstname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name is required."),
  body("lastname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last Name is required."),
  body("cfmpassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("status".trim()),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    try {
      const { email, firstname, lastname, password, status } = req.body;
      // Check if email exists
      const existingUser = await db.getEmail(email);
      if (existingUser.length > 0) {
        return res.status(500).json({
          success: false,
          message: "Email already exists",
        });
        password;
      }
      //Alter password and status before sending in
      const hashedPassword = await genPassword(password);

      let actualStatus;
      if (status === "admin" || "ADMIN") {
        actualStatus = "ADMIN";
      } else if (status === "TOP") {
        actualStatus = "PREMIER";
      } else {
        actualStatus = "STANDARD";
      }
      //Create a data object for sending into query
      const data = {
        email,
        firstname,
        lastname,
        hashedPassword,
        actualStatus,
      };

      const result = await db.postRegister(data);

      if (result.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Error Registering User",
        });
      }

      res.status(201).json({
        success: true,
        message: `Account created.`,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
      console.log(err);
    }
  }),
];
