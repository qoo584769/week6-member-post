const appErr = (httpStatus,errMsg,next)=>{
    const error = new Error(errMsg);
    error.statusCode = httpStatus;
    error.isOperational = true;
    next(error);
}

module.exports = appErr;