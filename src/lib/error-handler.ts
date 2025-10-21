export type ErrorType = "network" | "offline" | "validation" | "server" | "unknown"

export interface ErrorInfo {
    type: ErrorType
    message: string
    isRetryable: boolean
}

export function parseError(error: unknown, isOnline: boolean): ErrorInfo {
    // Check if it's a network error
    if (error instanceof TypeError) {
        if (error.message.includes("fetch") || error.message.includes("network")) {
            return {
                type: "network",
                message: "Network error. Please check your connection and try again.",
                isRetryable: true,
            }
        }
    }

    // Check if offline
    if (!isOnline) {
        return {
            type: "offline",
            message: "You are offline. Please check your internet connection.",
            isRetryable: true,
        }
    }

    // Handle fetch response errors
    if (error instanceof Response) {
        if (error.status === 400) {
            return {
                type: "validation",
                message: "Invalid input. Please check your data and try again.",
                isRetryable: false,
            }
        }
        if (error.status === 401) {
            return {
                type: "server",
                message: "Authentication failed. Please log in again.",
                isRetryable: false,
            }
        }
        if (error.status >= 500) {
            return {
                type: "server",
                message: "Server error. Please try again later.",
                isRetryable: true,
            }
        }
    }

    // Try to parse JSON error response
    if (typeof error === "object" && error !== null && "error" in error) {
        const errorMsg = (error as { error: string }).error
        return {
            type: "server",
            message: errorMsg || "An error occurred. Please try again.",
            isRetryable: true,
        }
    }

    return {
        type: "unknown",
        message: "An unexpected error occurred. Please try again.",
        isRetryable: true,
    }
}
