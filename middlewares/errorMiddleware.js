export default (err, req, res, next) => {

    let statusCode = err.statusCode || 500
    let message = err.message || "Internal Error"

    if (err.code === 11000) {
        statusCode = 400
        message = "The request body is already present! It must be unique!"
    }

    else if (err.name === "ValidationError") {
        statusCode = 400,
        message = "Your input is not valid!"
    }

    else if (err.name === "TokenExpiredError") {
        statusCode = 401,
        message = "Bearer Token is expired! Request a new token or log in again!"
    }

    else if (err.name === "JsonWebTokenError") {
        statusCode = 401,
        message = "Verification Failed! User not logged in or Token has been tampered!"
    } 

    res.status(statusCode).json({
        error: err.name,
        message: message,
    })
}