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

