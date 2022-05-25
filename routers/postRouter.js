const express = require('express')
const router = express.Router()

const postController = require('../controllers/postController')
// 驗證middleware
const isAuth = require('../middleware/isAuth')

const handleErrorAsync = require('../middleware/errorHandler')

// 取得所有動態
router.get(
  '/',
  handleErrorAsync(isAuth),
  handleErrorAsync(postController.getPost)
)
// 張貼動態
router.post(
  '/',
  handleErrorAsync(isAuth),
  handleErrorAsync(postController.postPost)
)

module.exports = router
