class ApplicationError implements Error {
  public name = "ApplicationError";

  constructor(public message: string) {}

  toString() {
    return this.name + ": " + this.message;
  }
}

class UserDataLoadError extends ApplicationError {
  public name = "UserDataLoadError";
}

class SentenceLoadError extends ApplicationError {
  public name = "SentenceLoadError";
}

class EmptyAnswerError extends ApplicationError {
  public name = "EmptyAnswerError";
}

export { UserDataLoadError, SentenceLoadError, EmptyAnswerError };
