// Errores que el servidor sabe convertir en una respuesta HTTP con su código.

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "No encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
