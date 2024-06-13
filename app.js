const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

const users = require("./models/blog")
const {userModel} = require("./models/blog")
const app = express()

const generateHashedPassword = async(password)=>{
    const salt = await bcryptjs.genSalt(10) //assume the cost of salt
    return bcryptjs.hash(password,salt)  
}

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://orwel000:orwel123@cluster0.hyugd.mongodb.net/bloguserDB?retryWrites=true&w=majority&appName=Cluster0")

app.post("/signup",async(req,res)=>{  //only an async() can call another async()
    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    input.password = hashedPassword
    let user = new users.userModel(input)
    user.save()
    res.json({"status":"success"})
})

app.post("/signin",(req,res)=>{
  let input = req.body
  userModel.find({"email":input.email}).then(
    (response)=>{
        if (response.length>0) {
            let dbpassword = response[0].password
            bcryptjs.compare(input.password,dbpassword,(error,isMatch)=>{
                if (isMatch) {
                    jwt.sign({email:input.email},"blog-app",{expiresIn:"1d"},
                        (error,token)=>{
                        if (error) {
                            res.json({"status":"unable to create token"})
                        } else {
                            res.json({"status":"succes","userId":response[0]._id,"token":token})
                        }
                    })
                } else {
                    res.json({"status":"Invalid credentials"})
                }
            })
        } else {
            res.json({"status":"user not found"})
        }
    }
  ).catch(
    (error)=>{
        res.json(error)
    }
  )  
})

app.listen(8080,()=>{
    console.log("Server Started")
})