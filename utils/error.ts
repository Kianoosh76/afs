export class ValidationError extends Error {
  constructor(public message: string) {
    super();
  }
}
