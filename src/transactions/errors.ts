export class TransactionError extends Error {
  logs: string[] | null

  constructor(message: string, logs: string[] | null) {
    super(message)
    this.logs = logs
  }
}
