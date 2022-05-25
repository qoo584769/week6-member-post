const express = require('express')
const router = express.Router()

const postController = require('../controllers/postController')

const handleErrorAsync = require('../middleware/errorHandler')

// 取得所有動態
router.get('/', handleErrorAsync(postController.getPost))
// 張貼動態
router.post('/', handleErrorAsync(postController.postPost))

module.exports = router
