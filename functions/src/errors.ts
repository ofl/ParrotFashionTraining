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

class AvailableArticleNotExist extends ApplicationError {
  public name = "AvailableArticleNotExist";
}

class ArticleNotFound extends ApplicationError {
  public name = "ArticleNotFound";
}

class QuestionTextNotFound extends ApplicationError {
  public name = "QuestionTextNotFound";
}

export {
  ApplicationError,
  UserDataLoadError,
  ArticleNotFound,
  AvailableArticleNotExist,
  QuestionTextNotFound
};
