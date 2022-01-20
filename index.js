// require('dotenv').config()

const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const userRouter = require('./routers/usersRouter')
const {logRequest} = require('./generalHelpers')
const { v4: uuidv4 } = require("uuid");
const { validateUser } = require("./userHelpers");
var jwt = require('jsonwebtoken');
const serverConfig = require('./serverConfig')
const { auth } = require('./middlewares/auth')
const User = require('./models/User')
require('./mongoConnect')


app.use(bodyParser.json())
/*
The Complete Node.js Developer Course
NodeJS - The Complete Guide

MongoDb the developer guide
Javascript the wird parts

javascript.info
https://www.linkedin.com/in/motazabuelnasr/

https://www.youtube.com/playlist?list=PLdRrBA8IaU3Xp_qy8X-1u-iqeLlDCmR8a
Fork the project 
git clone {url}
npm i


Bonus
Edit patch end point to handle the sent data only
If age is not sent return all users

Lab 5: 
user database instead of files
user jwt to authenticate users after login 
check if the user delete/patch/get his own document
check if user who use GET /users is authenticated

*/

app.post("/users/login",async (req, res, next) => {
      const {username, password} = req.body
      const user = await User.findOne({ username })
      if(!user) return next({status:401, message:"username or passord is incorrect"})
      if(user.password != password) next({status:401, message:"username or password is incorrect"})
      const payload = {id:user.id }
      const token = jwt.sign(payload, serverConfig.secret, {expiresIn: "2h"})
      return res.status(200).send({message:"Logged in Successfully", token}) 
})

app.post("/users", async (req, res, next) => {
  try {
      const { username, age, password } = req.body;
      const user = new User({username, age, password})
      await user.save() //call validate on schema
      res.send({ message: "sucess" });
  } catch (error) {
      next({ status: 422, message: error.message });
  }
});

app.patch("/users/:userId", auth , async (req, res, next) => {
  if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
  try {
    const {password, age} = req.body
    req.user.password = password
    req.user.age = age
    await req.user.save()
    res.send("sucess")
  } catch (error) { ///61e9b6cb4a1db8316cd9ad3f

  }

});


app.delete("/users/:userId", auth , async (req, res, next) => {
  if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
  constdbDelete= await User.deleteOne( { "_id" : (req.params.userId) })
  res.send("user deleted")

});



app.get('/users', auth, async (req,res,next)=>{
  try {
    const query = req.query.age ? {age:req.query.age} : {}
    const users = await User.find(query, {password:0})
  res.send(users)
  } catch (error) {
  next({ status: 500, internalMessage: error.message });
  }

})


app.use((err,req,res,next)=>{
  res.status(err.status).send(err.message)
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// mongodb, 