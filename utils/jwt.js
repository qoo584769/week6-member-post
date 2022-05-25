const jwt = require('jsonwebtoken')
require('dotenv').config()

const token = (user) => {
  return jwt.sign(
    // data的內容可以在登入解密出來
    {
      id: user._id,
    },
    // 給jwt一個字串當作加密編碼參考 需要隱藏起來 否則會有被反推的機會
    // 驗證的時候要用一樣的字串去解 不然會算不出原本的資料
    process.env.SECRET,
    {
      algorithm: 'HS256', // 加密方式
      // 多久之後到期 60一分鐘到期 60*60一小時
      // 也可以不用exp直接在secret後面加上{ expiresIn: '1h' }
      // exp: Math.floor(Date.now() / 1000) + 60 * 60,
      expiresIn: process.env.EXPIRES_IN,
    }
  )
}

// 驗證token是否到期
const verifyToken = (token) => {
  let result = ''
  console.log('token', token)

  //   取得現在時間 單位為秒
  const time = Math.floor(Date.now() / 1000)

  return new Promise((resolve, reject) => {
    //   使用jwt函式判斷token是否過期
    if (token) {
      // secret字串要跟token加密的字串一樣 最好是寫在 env 檔裡面
      jwt.verify(token, process.env.SECRET, (error, decoded) => {
        if (error) {
          result = {
            statusCode:401,
            isOperational:true,
            message:'token解密錯誤，請重新登入'
          }
          reject(result)
        } else if (decoded.exp <= time) {
          result = {
            statusCode:401,
            isOperational:true,
            message:'憑證已到期，請重新登入'
          }
          reject(result)
        } else {
          result = decoded.id
          resolve(result)
        }
      })
    } else {
      result = {
        statusCode:403,
        isOperational:true,
        message:'查無憑證，請重新登入'
      }
      reject(result)
    }
  })
}

module.exports = { token, verifyToken }
