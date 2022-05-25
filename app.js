const express = require('express')
require('./connection/mongooseDB')
// router
const userRouter = require('./routers/userRouter')
const postRouter = require('./routers/postRouter')

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', userRouter)
app.use('/posts', postRouter)

// 判斷網址不存在
app.use((req, res, next) => {
  res.status(404).send('頁面不存在')
})

// 正式環境錯誤訊息
const resErrProd = (err, res) => {
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.statusCode, message: err.message })
  } else {
    console.error('出現重大錯誤', err)
    return res
      .status(500)
      .json({ status: 'error', message: '系統錯誤，請聯絡系統管理員' })
  }
}
// 開發環境錯誤訊息
const resErrDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

// 判斷執行不存在的方法
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  // 開發環境錯誤
  if (process.env.NODE_ENV === 'dev') {
    return resErrDev(err, res)
  }
  // 正式環境錯誤
  if (err.name === 'ValidationError') {
    // 捕捉mongoose錯誤
    err.message = 'ID錯誤'
    err.isOperational = true
    return resErrProd(err, res)
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    if (err.type === 'entity.parse.failed') {
      // JSON parse failed
      return res.status(400).send({ status: 404, message: '非JSON格式' })
    }
    return res.status(500).send('程式出現問題，請稍後再試')
  }
  return resErrProd(err, res)
})

// 無法捕捉的catch
process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉的 rejection：', promise, '原因：', err)
})

module.exports = app



// /* eslint-disable no-underscore-dangle */
// /* eslint-disable no-console */
// /* eslint-disable consistent-return */
// // Model
// const jwt = require('jsonwebtoken')
// const User = require('../model/user')
// // Utils
// const catchAsync = require('../utils/catchAsync')
// const AppError = require('../utils/appError')
// const ApiState = require('../utils/apiState')
// const { successHandle } = require('../utils/resHandle')

// const {
//   checkEmail,
//   checkPassword,
//   verifyToken,
// } = require('../utils/verification')
// const { hashPassword } = require('../utils/hash')

// /*
//   res 回傳錯誤範例
//   return next(new AppError(ApiState.FIELD_MISSING))

//   ApiState.js 可自行新增需要的錯誤內容
// */

// /*
//   登入功能 POST /login
// */
// const login = catchAsync(async (req, res, next) => {
//   const memberData = {
//     email: req.body.email,
//     password: req.body.password,
//   }

//   if (!memberData.email || !memberData.password) {
//     return next(
//       new AppError({
//         message: '信箱、密碼為必填項目',
//         statusCode: ApiState.FIELD_MISSING.statusCode,
//       }),
//     )
//   }

//   memberData.password = hashPassword(req.body.password)

//   User.findOne({
//     email: memberData.email,
//     password: memberData.password,
//   }).exec((findErr, findRes) => {
//     console.log('findErr', findErr)
//     console.log('findRes', findRes)
//     if (findErr) {
//       return next(
//         new AppError({
//           message: findErr.message,
//           statusCode: ApiState.INTERNAL_SERVER_ERROR.statusCode,
//         }),
//       )
//     }

//     // find 沒找到東西的 res 是 null
//     if (findRes === null) {
//       return next(
//         new AppError({
//           message: '帳號密碼錯誤',
//           statusCode: ApiState.LOGIN_FAILED.statusCode,
//         }),
//       )
//     }

//     const token = jwt.sign(
//       // data的內容可以在登入解密出來
//       {
//         id: findRes._id,
//       },
//       // 給jwt一個字串當作加密編碼參考 需要隱藏起來 否則會有被反推的機會
//       // 驗證的時候要用一樣的字串去解 不然會算不出原本的資料
//       process.env.SECRET,
//       {
//         algorithm: 'HS256', // 加密方式
//         // 多久之後到期 60一分鐘到期 60*60一小時
//         // 也可以不用exp直接在secret後面加上{ expiresIn: '1h' }
//         // exp: Math.floor(Date.now() / 1000) + 60 * 60,
//         expiresIn: process.env.EXPIRES_IN,
//       },
//     )

//     res.setHeader('token', token)
//     return successHandle({
//       res,
//       message: '登入成功',
//       data: {
//         user: findRes,
//         token,
//       },
//     })
//   })
// })

// /*
//   註冊功能 POST /signup
// */
// const signup = catchAsync(async (req, res, next) => {
//   const memberData = {
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//   }
//   if (!memberData.name || !memberData.email || !memberData.password) {
//     return next(
//       new AppError({
//         message: '名稱、信箱、密碼為必填項目',
//         statusCode: ApiState.FIELD_MISSING.statusCode,
//       }),
//     )
//   }
//   if (!checkPassword(req.body.password)) {
//     return next(
//       new AppError({
//         message: '密碼格式錯誤，需包含至少一個英文字與數字，密碼八碼以上',
//         statusCode: ApiState.FIELD_MISSING.statusCode,
//       }),
//     )
//   }
//   if (!checkEmail(req.body.email)) {
//     return next(
//       new AppError({
//         message: '信箱格式錯誤',
//         statusCode: ApiState.FIELD_MISSING.statusCode,
//       }),
//     )
//   }

//   User.findOne({ email: memberData.email }, '_id name email').exec(
//     (findErr, findRes) => {
//       console.log('findErr', findErr)
//       console.log('findRes', findRes)
//       if (findErr) {
//         return next(
//           new AppError({
//             message: ApiState.INTERNAL_SERVER_ERROR.message,
//             statusCode: ApiState.INTERNAL_SERVER_ERROR.statusCode,
//           }),
//         )
//       }

//       if (findRes !== null) {
//         return next(
//           new AppError({
//             message: '信箱已被使用',
//             statusCode: ApiState.DATA_EXIST.statusCode,
//           }),
//         )
//       }
//     },
//   )

//   memberData.password = hashPassword(req.body.password)
//   const createRes = await User.create(memberData)
//   console.log('createRes', createRes)
//   const data = {
//     _id: createRes._id,
//     name: createRes.name,
//     email: createRes.email,
//   }
//   return successHandle({ res, message: '註冊成功', data })
// })

// /*
//   登出功能 GET /logout
// */
// const logout = catchAsync(async (req, res, next) => {
//   successHandle({ res, message: '登出成功' })
// })

// /*
//   修改密碼 PATCH /reset-password
// */
// const resetPassword = catchAsync(async (req, res, next) => {
//   const userId = req.user.id;
//   const reqId = req.body.id;

//   // 驗證要修改的帳號是不是登入的帳號
//   if (userId === reqId) {
    
//     // 驗證要改的密碼是否通過驗證
//     if (!checkPassword(req.body.password)) {
//       return next(
//         new AppError({
//           message: '密碼需至少一個英文字與數字，八碼以上',
//           statusCode: ApiState.FIELD_MISSING.statusCode,
//         })
//       );
//     }
    
//     // 測試資料全部都寫  如果沒填就用前端取得的舊會員資料
//     const memberData = {
//       id: userId,
//       name: req.body.name,
//       email: req.body.email,
//       password: hashPassword(req.body.password),
//     };

//     if (checkEmail(memberData.email)) {
//       User.findByIdAndUpdate({ _id: memberData.id }, memberData, {
//         new: true,
//         runValidators: true,
//       }).exec((updateErr, updateRes) => {
//         if (updateErr) {
//           return next(
//             new AppError({
//               message: '帳號不存在',
//               statusCode: ApiState.DATA_NOT_EXIST.statusCode,
//             })
//           );
//         }
//         return successHandle({ res, message: '更新成功', data: updateRes });
//       });
//     } else {
//       return next(
//         new AppError({
//           message: '信箱格式錯誤',
//           statusCode: ApiState.DATA_NOT_EXIST.statusCode,
//         })
//       );
//     }
//   }
//   // 如果不是現在登入的帳號
//   else {
//     return next(
//       new AppError({
//         message: '帳號與token不符合',
//         statusCode: ApiState.DATA_NOT_EXIST.statusCode,
//       })
//     );
//   }
// })

// /*
//   驗證token GET /check
// */
// const checkToken = catchAsync(async (req, res, next) => {
//   // 確認 token 是否存在
//   let token
//   if (
//     req.headers.authorization
//     && req.headers.authorization.startsWith('Bearer')
//   ) {
//     [, token] = req.headers.authorization.split(' ')
//   }

//   if (!token) {
//     return next(
//       new AppError({
//         message: 'token不存在',
//         status: ApiState.DATA_EXIST.status,
//         statusCode: ApiState.DATA_EXIST.statusCode,
//       }),
//     )
//   }
//   // 取的token驗證通過解密出來的使用者id
//   const verify = await verifyToken(token)
//   console.log('verify', verify)
//   if (verify) {
//     const result = await User.findOne({ _id: verify }, '_id name email')
//     console.log(result)
//     return successHandle({ res, message: '驗證通過', data: result })
//   }
//   console.log('ApiState.FAIL.status', ApiState.FAIL.status)
//   return next(
//     new AppError({
//       message: 'token不符合',
//       status: ApiState.FAIL.status,
//       statusCode: ApiState.FAIL.statusCode,
//     }),
//   )
// })

// // 驗證用middleware
// const isAuth = async (req, res, next) => {
//   // 確認 token 是否存在
//   let token
//   if (
//     req.headers.authorization
//     && req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[2]
//   }

//   if (!token) {
//     return next(
//       new AppError({
//         message: ApiState.LOGIN_FAILED.message,
//         status: ApiState.LOGIN_FAILED.status,
//         statusCode: ApiState.LOGIN_FAILED.statusCode,
//       }),
//     )
//   }

//   // 取的token驗證通過解密出來的使用者id
//   const verify = await verifyToken(token)
//   if (verify) {
//     console.log('驗證通過')
//     const result = await User.findOne({ _id: verify }, '_id name email')
//     req.user = result
//     next()
//   } else {
//     return next(
//       new AppError({
//         message: ApiState.LOGIN_FAILED.message,
//         status: ApiState.LOGIN_FAILED.status,
//         statusCode: ApiState.LOGIN_FAILED.statusCode,
//       }),
//     )
//   }
// }

// module.exports = {
//   login,
//   signup,
//   logout,
//   resetPassword,
//   checkToken,
//   isAuth,
// }
