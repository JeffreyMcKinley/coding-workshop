export interface ApplicationError extends Error {
  /** What HTTP status code to respond with */
  status: number;
  /**
   * Error code to return in the response,
   * used to conceal implementation details (error messages, stack traces)
   * while still providing a code that can be traced to specific logs
   * */
  code: string;
  /** Whether the error should be logged, true for unexpected errors, false for bussiness logic errors */
  log: boolean;
}
