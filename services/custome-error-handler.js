class CustomErrorHandler extends Error {
  // construtor
  constructor(status, msg) {
    super();
    this.status = status;
    this.message = msg;
  }

  // methods
  static required(message) {
    return new CustomErrorHandler(400, message);
  }
  static exists(message) {
    return new CustomErrorHandler(409, message);
  }
  static serverError(message = "Internal server error") {
    return new CustomErrorHandler(500, message);
  }
  static unAuthorized(message) {
    return new CustomErrorHandler(401, message);
  }
  static notRegistred(message) {
    return new CustomErrorHandler(403, message);
  }
  static unKnownError(message) {
    return new CustomErrorHandler(500, message);
  }
  static notFound(message) {
    return new CustomErrorHandler(404, message);
  }
}

module.exports = CustomErrorHandler;
