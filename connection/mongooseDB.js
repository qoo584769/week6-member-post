const mongoose = require('mongoose');
require('dotenv').config();

const DBString = process.env.MONGO_DB_CONNECTING_STRING.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

function DBConnect() {
  const DB = mongoose
    .connect(DBString)
    .then(() => {
      console.log('db connected');
    })
    .catch((err) => {
      console.log(err);
    });
  return DB;
}
DBConnect()
module.exports = DBConnect