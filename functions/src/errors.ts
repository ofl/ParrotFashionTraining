class ApplicationError implements Error {
  public name = "ApplicationError";

  constructor(public message: string) {}

  toString() {
    return this.name + ": " + this.message;
  }
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
  ArticleNotFound,
  AvailableArticleNotExist,
  QuestionTextNotFound
};
