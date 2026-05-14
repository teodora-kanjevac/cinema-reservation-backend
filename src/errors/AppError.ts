export class AppError extends Error {
    code: string
    status: number

    constructor(code: string, message: string, status = 400) {
        super(message)
        this.code = code
        this.status = status
    }
}

export interface ErrorResponse {
    error: {
        code: string
        message: string
    }
}
