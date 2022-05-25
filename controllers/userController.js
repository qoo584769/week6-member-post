const bcrypt = require('bcryptjs')
const validator = require('validator')

const appErr = require('../utils/appErr')

const {
  signupDB,
  signinDB,
  updatePasswordDB,
  getProfileDB,
  updateProfileDB,
} = require('../repository/userRepl')
const jwt = require('../utils/jwt')
// 註冊
const signup = async (req, res, next) => {
  const { name, email, password } = req.body

  // 有資料未填寫
  if (!name || !email || !password) {
    return next(appErr('400', '註冊資料未填寫正確', next))
  }

  // 驗證信箱格式
  if (!validator.isEmail(email)) {
    return next(appErr('400', 'email 格式錯誤', next))
  }

  // 驗證是否是高強度密碼
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    return next(appErr('400', '密碼至少一英文一數字，八碼以上', next))
  }

  // 驗證通過加密密碼
  hashedPassword = await bcrypt.hash(password, 12)

  // 加密完寫入資料庫
  const memberData = {
    name,
    email,
    password: hashedPassword,
  }
  const result = await signupDB(memberData)
  // 如果信箱被註冊過
  if (!result.status) {
    return next(appErr('400', result.message, next))
  }
  // 註冊成功
  return res.status(200).json({
    message: '註冊成功',
    ...result,
  })
}
// 登入
const signin = async (req, res, next) => {
  const { email, password } = req.body
  // 驗證是否有未填欄位
  if (!email || !password) {
    return appErr(400, '帳號密碼為必填', next)
  }
  const user = await signinDB(email)
  // 如果信箱沒註冊過
  if (!user) {
    return next(appErr('400', '查無此會員', next))
  }
  // 有找到註冊的密碼
  const compare = await bcrypt.compare(password, user.password)
  if (!compare) {
    return next(appErr('400', '密碼錯誤', next))
  }
  // 密碼正確再加上token
  const token = jwt.token(user)
  // 登入成功 回傳去掉密碼的資料
  const { _id, name, shot, postid } = user
  return res.status(200).json({
    _id,
    name,
    shot,
    postid,
    token,
    message: '登入成功',
  })
}
// 更新密碼
const updatePassword = async (req, res, next) => {
  const { id, password, passwordConfirm } = req.body
  const _id = req._id
  // 驗證是否同一帳號
  if (id !== _id) {
    return next(appErr(400, '帳號驗證錯誤，請重新登入', next))
  }
  // 新密碼與二次確認不相符
  if (!password || !passwordConfirm || password !== passwordConfirm) {
    return next(appErr(400, '密碼不同，請重新輸入', next))
  }
  //加密新密碼
  hashedPassword = await bcrypt.hash(password, 12)
  const modelData = { _id, password: hashedPassword }
  // 驗證通過更新資料庫
  const result = await updatePasswordDB(modelData)
  // 密碼更新成功
  return res.status(200).json({
    result,
    message: '密碼更新成功',
  })
}
// 取得會員資料
const getProfile = async (req, res, next) => {
  const { id } = req.body
  const _id = req._id
  // 驗證是否同一帳號
  if (id !== _id) {
    return next(appErr(400, '帳號驗證錯誤，請重新登入', next))
  }
  // 驗證通過取得資料
  const result = await getProfileDB(_id)
  // 取得資料成功
  return res.status(200).json({
    result,
    message: '取得使用者資料成功',
  })
}
// 編輯會員資料
const editProfile = async (req, res, next) => {
  let { id, name, gender, shot } = req.body
  console.log(gender);
  const _id = req._id
  // 驗證是否同一帳號
  if (id !== _id) {
    return next(appErr(400, '帳號驗證錯誤，請重新登入', next))
  }
  // 使用者暱稱驗證
  if (!name || name==='') {
    name = '預設使用者'
  }
  // 性別驗證
  if (!gender || gender==='') {
    gender = 'male'
  }
  // 大頭照驗證
  if (!shot || shot==='') {
    shot = '預設使用者圖片'
  }
  const userData = {
    _id,
    name,
    gender,
    shot,
  }
  const result = await updateProfileDB(userData)
  // 使用者資料更新成功
  return res.status(200).json({
    result,
    message: '使用者資料更新成功',
  })
}

module.exports = { signup, signin, updatePassword, getProfile, editProfile }
