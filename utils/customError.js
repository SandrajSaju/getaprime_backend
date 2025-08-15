class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Set the prototype
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

module.exports = CustomError;