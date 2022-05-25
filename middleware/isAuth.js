const appErr = require('../utils/appErr')
const { verifyToken } = require('../utils/jwt')
// 驗證用middleware
const isAuth = async (req, res, next) => {
  // 確認 token 是否存在
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.replace('Bearer ', '')
  } else {
    return next(appErr(401, 'header驗證錯誤', next))
  }

  if (!token) {
    return next(appErr(403, '請重新登入', next))
  }

  // 取的token驗證通過解密出來的使用者id
  const verify = await verifyToken(token)
  if (verify) {
    console.log('驗證通過')
    req._id = verify
    next()
  } else {
    return next(401, '解密錯誤或憑證過期，請重新登入', next)
  }
}

module.exports = isAuth
