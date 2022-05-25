const appErr = require('../utils/appErr')

const { getPostDB, postPostDB } = require('../repository/postRepl')

// 取的貼文
const getPost = async (req, res, next) => {
  const _id = req._id
  const timeSort = req.query.timeSort == 'asc' ? 'createdAt' : '-createdAt'
  const id =
    req.query._id !== undefined ? { _id: new RegExp(req.query._id) } : _id
  const data = {
    timeSort,
    id,
  }
  const result = await getPostDB(data)
  // 如果要取得別的會員的貼文資料
  if (!result) {
    return next(appErr(400, '此會員尚未註冊', next))
  }
  // 貼文取得成功
  return res.status(200).json({
    result,
    message: '貼文取得成功',
  })
}
// 發佈貼文
const postPost = async (req, res, next) => {
  const { userid, content } = req.body
  const _id = req._id
  // 驗證是否同一帳號
  if (userid !== _id) {
    return next(appErr(400, '帳號驗證錯誤，請重新登入', next))
  }
  if (content === undefined) {
    return next(appErr(400, '貼文內容未填寫', next))
  }
  const data = { _id, content }
  // 新增新貼文
  const result = await postPostDB(data)
  // 新增貼文成功
  return res.status(200).json({
    result,
    message: '貼文發佈成功',
  })
}

module.exports = { getPost, postPost }
