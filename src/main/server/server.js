import express from 'express'
const app = express()
const {clipboard} =  require('electron')
const que = []
app.get('/message', (req, res) => {
  res.send('这是来自node服务端的信息')
})

app.post('/message', (req, res) => {
  if (req) {
    res.send(req + '--来自node')
  }
})

/**
 * 主线程从clipboard中读取复制内容,在que队列里查找不重复就添加进队列.
 * 如果大于等于15条就在队列的首部删除一个在添加新的进队列尾部
 */
setInterval(()=>{
  let world  =  clipboard.readText()
  if (!(que.find((f)=>f===world))&&que.length<15&&world){
    que.push(world)
  }
  if (!(que.find((f)=>f===world))&&que.length>=15&&world){
    que.shift()
    que.push(world)
  }
},3000)

app.get('/copyMsg',(req,res)=>{
  res.send(que)
})

export default app
