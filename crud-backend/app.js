const express = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const authenticate = require('./middleware/Authenticate')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const Schema = mongoose.Schema;

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded())


const port = process.env.PORT || 8000

dotenv.config({ path: './config.env' })

mongoose.connect("mongodb://127.0.0.1:27017/signup").then(() => {
    console.log("connected")
}).catch((e) => {
    console.log(e)
})

//NEW SCHEMA FOR SIGNUP FORM
const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    rePassword: {
        type: String,
        required: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],



})

signupSchema.methods.generateToken = async function () {
    try {

        let token = jwt.sign({ _id: this._id }, `${process.env.SECRET_KEY}`)
        this.tokens = this.tokens.concat({ token: token })
        await this.save()
        return token;
    } catch (e) {
        console.log(e)
    }
}
signupSchema.methods.logout = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '1h' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


const User = new mongoose.model("User", signupSchema)


//SECOND SCHEMA FOR CRUD ENTRIES

const crudSchema = new Schema({
    userId: {
        type: String
    },
    fname: {
        type: String,
        // required: true,
        minLength: 3,
        maxLength: 20
    },
    lname: {
        type: String,
        // required: true,
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        // required: true,
        // unique: true
    },
    mobile: {
        type: Number,
        min: 10,
    }
})

const Crud = new mongoose.model("Crud", crudSchema)



app.post("/register", async (req, res) => {

    const { name, email, password, rePassword } = req.body;
    try {
        const user1 = await User.findOne({ email: email })
        if (user1) {
            res.send("user Already Exist")
        } else {
            const user2 = new User({
                name: name,
                email,
                password,
                rePassword,

            })
            console.log(user2)
            await user2.save().then(() => {
                res.status(201).send("Created SuccessFully")
            }).catch((_e) => {
                res.status(500).send("Server Error")
            })
        }
    } catch (e) {
        console.log(e)
    }

})

app.post("/login", async (req, res) => {

    try {

        let token;
        const { email, password } = req.body
        const userLogin = await User.findOne({ email: email })
        console.log(userLogin._id)
        if (userLogin) {

            token = await userLogin.generateToken()
            console.log(token)
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 2389200000),
                httpOnly: true
            })
            if (password === userLogin.password) {
                res.send({ message: "successfully login", user: userLogin })
            } else {
                res.send({ message: "Password didnt match" })
            }

        }
    } catch (e) {
        res.status(500).send(e)
    }
})

app.post("/additem", async (req, res) => {
    const { fname, lname, email, mobile } = req.body;
    let userLogin2 = await User.findOne({ email: email })
    const crudDetails = new Crud({
        userId: userLogin2._id,
        fname: fname,
        lname: lname,
        email: email,
        mobile: mobile
    })
    console.log(crudDetails)
    await crudDetails.save().then(() => {
        res.status(201).send("Successfully saved")
    }).catch((_e) => {
        res.status(500).send("Server Error 2")
    })
})

app.get('/api/:email', async (req, res) => {
    try {
        const email2 = req.params.email
        if (!email2) {
            res.status(404).send({ message: "Login required" })
        } else {
            const data = await Crud.find({}).where('email').equals(email2)
            res.send({ data: data })
        }
    } catch (e) {
        console.log(e)
    }
})

app.delete("/deleteApi/:id", async (req, res) => {
    try {
        const _id = req.params.id;
        const deleteData = await Crud.findByIdAndRemove(_id)
        if (!deleteData) {
            return res.status(404).send("page not found")
        } else {
            return res.status(200).send({ message: "deleted", deleteData: deleteData })
        }
    } catch (e) {
        res.status(500).send(e)
    }
})

app.get("/showApi/:id", async (req, res) => {
    const _id = req.params.id;
    const showData = await Crud.findById(_id)
    console.log(showData)
    try {
        if (!showData) {
            return res.status(404).json("DataBase Is Empty")
        } else {
            return res.status(200).json({ message: "successfully show", showData: [showData] })
        }
    } catch (e) {
        res.status(500).json("Internal Servar Error")
    }
})

app.patch("/updateApi/:id", async (req, res) => {
    const _id = req.params.id;

    const updatedUser = await Crud.findByIdAndUpdate(_id, req.body, {
        new: true
    })
    try {

        if (!updatedUser) {
            return res.status(404).json("database is empty")
        } else {
            return res.status(200).json({ message: "success22", data: updatedUser })
        }
    } catch (e) {
        res.status(500).json("server error")
    }
})

app.get("/logout", (req, res) => {
    res.status(201).send("logout")
})

app.listen(port, () => {
    console.log("listen")
})




































// // const express = require('express')
// // const mongoose = require('mongoose')
// // const validator = require('validator')
// // const authenticate = require('./middleware/Authenticate')
// // const dotenv = require('dotenv')
// // const cors = require('cors')
// // const jwt = require("jsonwebtoken")
// // const Schema = mongoose.Schema;

// // const app = express()
// // app.use(express.json())
// // app.use(cors())
// // app.use(express.urlencoded())



// // const port = process.env.PORT || 8000;
// // dotenv.config({path:'./config.env'})



// // mongoose.connect("mongodb://127.0.0.1:27017/signup33").then(()=>{
// //     console.log("connected")
// // }).catch((e)=>{
// //     console.log(e)
// // })

// // //NEW SCHEMA FOR SIGNUP FORM
// // const signupSchema = new mongoose.Schema({
// //     name:{
// //         type:String,
// //         required:true,
// //         minLength:3,
// //         maxLength:20
// //     },
// //     email:{
// //         type:String,
// //         required:true,
// //         unique:true,
// //         validate(value){
// //             if(!validator.isEmail(value)){
// //                 throw new Error("Invalid Email")
// //             }
// //         }
// //     },
// //     password:{
// //         type:String,
// //         required:true,
// //     },
// //     rePassword:{
// //         type:String,
// //         required:true,
// //     },
// //     tokens: [
// //         {
// //             token: {
// //                 type: String,
// //                 required: true
// //             }
// //         }
// //     ],

// // })
// // // signupSchema.methods.generateToken = async function () {
// // //     try {
        
// // //         let token = jwt.sign({ _id: this._id }, `${process.env.SECRET_KEY}`)
// // //         this.tokens = this.tokens.concat({ token: token })
// // //         await this.save()
// // //         return token;
// // //     } catch (e) {
// // //         console.log(e)
// // //     }
// // // }

// // const User = new mongoose.model("User",signupSchema)

// // //SECOND SCHEMA FOR CRUD ENTRIES

// // const crudSchema = new mongoose.Schema({
// //     userId: {
// //         type: String
// //     },
    
// //     fname:{
// //         type:String,
// //         // required:true,
// //         minLength:3,
// //         maxLength:20
// //     },
// //     lname:{
// //         type:String,
// //         // required:true,
// //         minLength:3,
// //         maxLength:20
// //     },
// //     email:{
// //         type:String,
// //         // required:true,
// //         // unique:true
// //     }
// // })


// // const Crud = new mongoose.model("Crud",crudSchema)



// // app.post("/register",async(req,res)=>{

// //     const {name ,email , password , rePassword} = req.body;
// //     console.log(req.body)
// //     // User.findOne({email:email},(_err,user1) => {
// //     //     if(user1){
// //     //         res.send("user Already Exist")
// //     //     }else{
// //     //         const user1 = new User({
// //     //             name:name,
// //     //             email,
// //     //             password,
// //     //             rePassword
// //     //         })
// //     //         user1.save().then(()=>{
// //     //             res.status(201).send("Created SuccessFully")
// //     //         }).catch((_e)=>{
// //     //             res.status(500).send("Server Error")
// //     //         })
// //     //     }
// //     // })}
    
// //     const user1 = User.findOne({email:email})
// //     // console.log(user1)
// //     if (user1) {
// //         res.send("user Already Exist")
// //     } else {
// //         const user2 = new User({
// //             name: name,
// //             email,
// //             password,
// //             rePassword,
            
// //         })
// //         console.log(user2)
// //         await user2.save().then(() => {
// //             res.status(201).send("Created SuccessFully")
// //         }).catch((_e) => {
// //             res.status(500).send("Server Error")
// //         })
// //     }
    
// // })

        
    
// //     // signupSchema.methods.generateAuthToken = async function(){
// //     //     try{
// //     //         const token = jwt.sign({_id:this._id.toString()}, "mynameissanahmathurageistwentyoneyears");
// //     //         console.log(token);
// //     //     }catch(error) {
// //     //         res.send("the error part" + error);
// //     //         console.log("the error part" + error);
// //     //     }
// //     // }

    

// // app.post("/login",(req,res)=>{
// //     // res.end("hii from backend")
// //     // const {email, password} = req.body
// //     // User.findOne({email:email},(_err,user) => {
// //     //     if(user){
// //     //         if(password===user.password){
// //     //             res.send({message:"successfully login" ,user:user})
// //     //         }else{
// //     //             res.send({message:"Password didnt match"})
// //     //         }
// //     //     }else{
// //     //         res.send({message:"You Are Not Registerd"})
// //     //     }
// //     // })

// //     try{
        

// //         // let token;
// //         const { email, password } = req.body
// //         console.log(JSON.stringify(req.body))
// //         localStorage.setItem(req.body.email)
// //     const userLogin = User.findOne({ email: email })
// //     console.log(userLogin.email)
// //     if (userLogin) {
// //         console.log(userLogin)

// //         const crudDet = new Crud({
// //             userId:userLogin._id
// //         }).save()


// //         // token = userLogin.generateToken()
// //         // console.log(token)
// //         // res.cookie("jwtoken",token,{
// //         //     expires:new Date(Date.now()+2389200000),
// //         //     httpOnly:true
// //         //  })
// //         if (password === userLogin.password) {
// //             res.send({ message: "successfully login", user: userLogin })
// //         } else {
// //             res.send({ message: "Password didnt match" })
// //         }

// //     }
// //     }catch(e){
// //         res.status(500).send(e)
// //     }
// // }
// // )


// // app.post("/additem",async(req, res) => {
// //     const { fname, lname, email } = req.body;
// //     // console.log(req.body)
// //     let userLogin2 = await User.findOne({email:email})
// //     // console.log(userLogin2)
// //     const crudDetails = new Crud({
// //         userId:userLogin2._id,
// //         fname:fname,
// //         lname:lname,
// //         email:email
// //     })
// //     console.log(crudDetails)
// //     await crudDetails.save().then(() => {
// //         res.status(201).json("Successfully saved")
// //     }).catch((_e) => {
// //         res.status(500).json("Server Error 2")
// //     })
// // })
// // // app.post("/additem",async(req,res)=>{
// // //     const {fname,lname,email} = req.body;
// // //     const crudDetails = new Crud({
    
// // //         fname,
// // //         lname,
// // //         email
// // //     })
// // //     console.log(crudDetails)
// // //     await crudDetails.save().then(()=>{
// // //         res.status(201).send("Successfully saved")
// // //     }).catch((_e)=>{
// // //         res.status(500).send("Server Error 2")
// // //     })
// // // })

// // app.get('/api/:email',async(req,res)=>{
// //     // try{
// //     //     const data = await Crud.find()
// //     //     res.send({message:"done",data:data})
// //     // }catch(e){
// //     //     console.log(e)
// //     // }
// //     try {
// //         const email2 = req.params.email
// //         if(!email2){
// //             res.status(404).send({message:"Login required"})
// //         }else{
// //             const data = await Crud.find({}).where('email').equals(email2)
// //             res.send({ data: data })
// //         }
// //     } catch (e) {
// //         console.log(e)
// //     }
// // })

// // app.delete("/deleteApi/:id",async(req,res)=>{
// //     try{
// //         const _id = req.params.id;
// //         const deleteData = await Crud.findByIdAndRemove(_id)
// //         if(!deleteData){
// //             return res.status(404).send("page not found")
// //         }else{
// //             return res.status(200).send({message:"deleted",deleteData:deleteData})
// //         }
// //     }catch(e){
// //         res.status(500).send(e)
// //     }
// // })

// // app.get("/showApi/:id",async(req,res)=>{
// //     const _id = req.params.id;
// //     const showData = await Crud.findById(_id)
// //     console.log(showData)
// //     try{
// //         if(!showData){
// //             return res.status(404).json("DataBase Is Empty")
// //         }else{
// //             return res.status(200).json({message:"successfully show",showData:[showData]})
// //         }
// //     }catch(e){
// //         res.status(500).json("Internal Servar Error")
// //     }
// // })

// // app.patch("/updateApi/:id",async(req,res)=>{
// //     const _id = req.params.id;

// //         const updatedUser = await Crud.findByIdAndUpdate(_id,req.body,{
// //             new:true
// //         })
// //     try{
        
// //         if(!updatedUser){
// //             return res.status(404).send("database is empty")
// //         }else{
// //             return res.status(200).send({message:"success22",data:updatedUser})
// //         }
// //     }catch(e){
// //         res.status(500).send("server error")
// //     }
// // })

// // // const createToken = async() => {
// // //     const token = await jwt.sign({_id:""}, "mynameissanahmathurageistwentyoneyears");
// // //     console.log(token);
// // //     const userVer = await jwt.verify(token, "mynameissanahmathurageistwentyoneyears");
// // //     console.log(userVer);
// // // }
// // // createToken();

// // app.get("/logout",(req,res)=>{
// //     res.status(201).send("logout")
// // })

// // app.listen(port,()=>{
// //     console.log("listen");
// // })

// const express = require('express')
// const mongoose = require('mongoose')
// const validator = require('validator')
// const authenticate = require('./middleware/Authenticate')
// const dotenv = require('dotenv')
// const jwt = require('jsonwebtoken')
// const cors = require('cors')
// const Schema = mongoose.Schema;

// const app = express()
// app.use(express.json())
// app.use(cors())
// app.use(express.urlencoded())


// const port = process.env.PORT || 8000

// dotenv.config({ path: './config.env' })

// mongoose.connect("mongodb://127.0.0.1:27017/signup_sanah").then(() => {
//     console.log("connected")
// }).catch((e) => {
//     console.log(e)
// })

// //NEW SCHEMA FOR SIGNUP FORM
// const signupSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         minLength: 3,
//         maxLength: 20
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         validate(value) {
//             if (!validator.isEmail(value)) {
//                 throw new Error("Invalid Email")
//             }
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     rePassword: {
//         type: String,
//         required: true,
//     },
//     tokens: [
//         {
//             token: {
//                 type: String,
//                 required: true
//             }
//         }
//     ],



// })

// signupSchema.methods.generateToken = async function () {
//     try {

//         let token = jwt.sign({ _id: this._id }, `${process.env.SECRET_KEY}`)
//         this.tokens = this.tokens.concat({ token: token })
//         await this.save()
//         return token;
//     } catch (e) {
//         console.log(e)
//     }
// }

// const User = new mongoose.model("User", signupSchema)


// //SECOND SCHEMA FOR CRUD ENTRIES

// const crudSchema = new Schema({
//     userId: {
//         type: String
//     },
//     fname: {
//         type: String,
//         // required: true,
//         minLength: 3,
//         maxLength: 20
//     },
//     lname: {
//         type: String,
//         // required: true,
//         minLength: 3,
//         maxLength: 20
//     },
//     email: {
//         type: String,
//         // required: true,
//         // unique: true
//     },
//     mobile: {
//         type: Number,
//         min: 10,
//     }
// })

// const Crud = new mongoose.model("Crud", crudSchema)



// app.post("/register", async (req, res) => {

//     const { name, email, password, rePassword } = req.body;
//     try {
//         const user1 = await User.findOne({ email: email })
//         if (user1) {
//             res.send("user Already Exist")
//         } else {
//             const user2 = new User({
//                 name: name,
//                 email,
//                 password,
//                 rePassword,

//             })
//             console.log(user2)
//             await user2.save().then(() => {
//                 res.status(201).send("Created SuccessFully")
//             }).catch((_e) => {
//                 res.status(500).send("Server Error")
//             })
//         }
//     } catch (e) {
//         console.log(e)
//     }

// })

// app.post("/login", async (req, res) => {

//     try {

//         let token;
//         const { email, password } = req.body
//         const userLogin = await User.findOne({ email: email })
//         console.log(userLogin._id)
//         if (userLogin) {

//             token = await userLogin.generateToken()
//             console.log(token)
//             res.cookie("jwtoken", token, {
//                 expires: new Date(Date.now() + 2389200000),
//                 httpOnly: true
//             })
//             if (password === userLogin.password) {
//                 res.send({ message: "successfully login", user: userLogin })
//             } else {
//                 res.send({ message: "Password didnt match" })
//             }

//         }
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

// app.post("/additem", async (req, res) => {
//     const { fname, lname, email, mobile } = req.body;
//     let userLogin2 = await User.findOne({ email: email })
//     const crudDetails = new Crud({
//         userId: userLogin2._id,
//         fname: fname,
//         lname: lname,
//         email: email,
//         mobile: mobile
//     })
//     console.log(crudDetails)
//     await crudDetails.save().then(() => {
//         res.status(201).send("Successfully saved")
//     }).catch((_e) => {
//         res.status(500).send("Server Error 2")
//     })
// })

// app.get('/api/:email', async (req, res) => {
//     try {
//         const email2 = req.params.email
//         if (!email2) {
//             res.status(404).send({ message: "Login required" })
//         } else {
//             const data = await Crud.find({}).where('email').equals(email2)
//             res.send({ data: data })
//         }
//     } catch (e) {
//         console.log(e)
//     }
// })

// app.delete("/deleteApi/:id", async (req, res) => {
//     try {
//         const _id = req.params.id;
//         const deleteData = await Crud.findByIdAndRemove(_id)
//         if (!deleteData) {
//             return res.status(404).send("page not found")
//         } else {
//             return res.status(200).send({ message: "deleted", deleteData: deleteData })
//         }
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

// app.get("/showApi/:id", async (req, res) => {
//     const _id = req.params.id;
//     const showData = await Crud.findById(_id)
//     console.log(showData)
//     try {
//         if (!showData) {
//             return res.status(404).json("DataBase Is Empty")
//         } else {
//             return res.status(200).json({ message: "successfully show", showData: [showData] })
//         }
//     } catch (e) {
//         res.status(500).json("Internal Servar Error")
//     }
// })

// app.patch("/updateApi/:id", async (req, res) => {
//     const _id = req.params.id;

//     const updatedUser = await Crud.findByIdAndUpdate(_id, req.body, {
//         new: true
//     })
//     try {

//         if (!updatedUser) {
//             return res.status(404).json("database is empty")
//         } else {
//             return res.status(200).json({ message: "success22", data: updatedUser })
//         }
//     } catch (e) {
//         res.status(500).json("server error")
//     }
// })

// app.get("/logout", (req, res) => {
//     res.status(201).send("logout")
// })

// app.listen(port, () => {
//     console.log("listen")
// })