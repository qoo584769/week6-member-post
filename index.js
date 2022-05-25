const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`伺服器已啟動在 ${PORT} port`);
})