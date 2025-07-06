const { validationResult } = require('express-validator');

module.exports.checkExpressValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
// This middleware checks for validation errors in the request.
// If there are errors, it responds with a 400 status and the error details.
// If there are no errors, it calls the next middleware in the stack.
// Usage: Place this middleware after your validation rules in your route handlers.
// Example usage in a route handler:
// router.post('/some-route', validationRules, checkExpressValidationErrors, (req, res) => {
//       Handle the request if there are no validation errors
//   res.status(200).json({ message: 'Success' });
