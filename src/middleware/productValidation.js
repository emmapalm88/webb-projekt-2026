/*import { body, validationResult } from "express-validator";

export const validateProduct = [
  body("name").notEmpty().withMessage("Name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be greater than 0"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be greater than 0"),
  body("image").notEmpty().withMessage("Image is required"),
  body("slug").notEmpty().withMessage("Slug is required"),
  //TODO: Add more validation rules as needed
];

export const validateProductResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};