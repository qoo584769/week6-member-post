const { Schema, model } = require('mongoose')

const postSchema = new Schema(
  {
    content: {
      type: String,
      require: [true, '貼文內容必填'],
    },
    image: {
      type: String,
      default: '',
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    createAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    versionKey: false,
  }
)

const postModel = model('post', postSchema)

module.exports = { postModel }
