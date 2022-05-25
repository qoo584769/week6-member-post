const { userModel } = require('../models/userModel')

// 註冊  modelData 為一個物件
const signupDB = async (modelData) => {
  const { email } = modelData

  // 驗證信箱是否註冊過
  const emailRes = await userModel.findOne({ email }, 'email')
  if (emailRes) {
    return { status: false, message: '信箱已被註冊' }
  }

  // 信箱未註冊過 新增到資料庫
  const createRes = await userModel.create(modelData)
  const data = {
    status: 'success',
    _id: createRes._id,
    name: createRes.name,
    email: createRes.email,
  }
  return data
}
// 登入 modelData 只傳入email
const signinDB = async (modelData) => {
  const email = modelData
  const result = await userModel.findOne({ email }).select('+password')
  return result
}
// 重設密碼  modelData 為一個物件
const updatePasswordDB = async (modelData) => {
  const { _id, password } = modelData
  const result = await userModel.findByIdAndUpdate(
    _id,
    {
      password,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  return result
}
// 取得會員資料  modelData 只傳入 id
const getProfileDB = async (modelData) => {
  const _id = modelData
  const result = await userModel.findById(_id)
  return result
}
// 更新會員資料  modelData 為一個物件
const updateProfileDB = async (modelData) => {
  const { _id, name, gender, shot } = modelData
  const result = await userModel.findByIdAndUpdate(
    _id,
    { name, gender, shot },
    { new: true, runValidators: true }
  )
  return result
}

module.exports = {
  signupDB,
  signinDB,
  updatePasswordDB,
  getProfileDB,
  updateProfileDB,
}
