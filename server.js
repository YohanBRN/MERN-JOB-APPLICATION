const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const status = require("statuses");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use("/uploads", express.static("uploads"));


let authoriseToken = (req,res,next)=>{
console.log(req.headers.authorization);
next();
};
app.use(authoriseToken);

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  email: String,
  password: String,
  mobileNo: Number,
  profilePic: String,
});

let User = new mongoose.model("user", userSchema);

app.post("/signup", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);
  console.log(req.file.path);

  let emailUser = await User.find().and({ email: req.body.email });
  if (emailUser.length > 0) {
    res.json({ status: "Failure", msg: "User Already exist" });
  } else {

let hashedPassword = await bcrypt.hash(req.body.password,10)

    try {
      let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        email: req.body.email,
        password: hashedPassword,
        mobileNo: req.body.mobileNo,
        profilePic: req.file.path,
      });

      await User.insertMany([newUser]);
      res.json({ status: "success", msg: "user created successfully" });
    } catch (err) {
      res.json({
        status: "failure",
        msg: "unable to create account",
        err: err,
      });
    }
  }
});

app.post("/login", upload.none(), async (req, res) => {
  console.log(req.body);

  let userDetails = await User.find().and({ email: req.body.email });
  console.log(userDetails);

  if (userDetails.length >0) {
    // if (userDetails[0].password == req.body.password) {
  if (await bcrypt.compare(req.body.password,userDetails[0].password)==true){
      let token = jwt.sign(
        {
          email: req.body.email,
          password: req.body.password,
        },
        "bazooka"
      );

      let userDataToSend = {
        firstName: userDetails[0].firstName,
        lastName: userDetails[0].lastName,
        age: userDetails[0].age,
        email: userDetails[0].email,
        mobileNo: userDetails[0].mobileNo,
        profilePic: userDetails[0].profilePic,
        token: token,
      };
      res.json({ status: "Success", data: userDataToSend });
    } else {
      res.json({ status: "Failure", msg: "Invalid Password" });
    }
  } else {
    res.json({ status: "Failure", msg: "User does not exist" });
  }
});

app.post("/loginWithToken", upload.none(), async (req, res) => {
  console.log(req.body);

  let decryptedToken = jwt.verify(req.body.token, "bazooka");
  console.log(decryptedToken);

  let userDetails = await User.find().and({ email: decryptedToken.email });
  if (userDetails.length > 0) {
    if (userDetails[0].password == decryptedToken.password) {
      let userDataToSend = {
        firstName: userDetails[0].firstName,
        lastName: userDetails[0].lastName,
        age: userDetails[0].age,
        email: userDetails[0].email,
        mobileNo: userDetails[0].mobileNo,
        profilePic: userDetails[0].profilePic,
      };
      res.json({ status: "Success", data: userDataToSend });
    } else {
      res.json({ status: "Failure", msg: "Invalid Token" });
    }
  } else {
    res.json({ status: "Failure", msg: "Invalid Token" });
  }
});

app.patch("/updateProfile", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);

  try {
    if (req.body.firstName.trim().length > 0) {
      let updatedDetails = await User.updateMany(
        { email: req.body.email },
        { firstName: req.body.firstName }
      );
    }
    if (req.body.lastName.trim().length > 0) {
      let updatedDetails = await User.updateMany(
        { email: req.body.email },
        { lastName: req.body.lastName }
      );
    }

    if (req.body.age.trim().length > 0) {
      let updatedDetails = await User.updateMany(
        { email: req.body.email },
        { age: req.body.age }
      );
    }
    if (req.body.password.trim().length > 0) {
      let updatedDetails = await User.updateMany(
        { email: req.body.email },
        { password: req.body.password }
      );
    }
 
  if (req.body.mobileNo.trim().length > 0) {
    let updatedDetails = await User.updateMany(
      { email: req.body.email },
      { mobileNo: req.body.mobileNo }
    );
  }

  console.log(req.file)
  if (req.file) {
    let updatedDetails = await User.updateMany(
      { email: req.body.email },
      { profilePic: req.file.path }
    );
  }


    res.json({ status: "success", msg: "user details updated Successfully" });
  } catch (err) {
    res.json({
      status: "failure",
      msg: "unable to update user details",
      err: err,
    });
  }

  // try{
  //  if(req.body.firstName.trim().length >0){
  //   let updatedDetails = await User.updateMany(
  //       {emil:req.body.email},
  //       {firstName:req.body.firstName}
  //     );
  //   }
  // if(req.body.lastName.trim().length >0){
  //   let updatedDetails = await User.updateMany(
  //     {emil:req.body.email},
  //     {lastName:req.body.lastName}
  //   );
  // }
  // if(req.body.age.trim().length >0){
  //   let updatedDetails = await User.updateMany(
  //     {emil:req.body.email},
  //     {age:req.body.age}
  //   );
  // }
  // if(req.body.password.trim().length >0){
  //   let updatedDetails = await User.updateMany(
  //     {emil:req.body.email},
  //     {password:req.body.password}
  //   );
  // }
  // if(req.body.mobileNo.trim().length >0){
  //   let updatedDetails = await User.updateMany(
  //     {emil:req.body.email},
  //     {mobileNo:req.body.mobileNo}
  //   );
  // }
  // res.json({status:"Success",msg:"user details updated Successfully"})
  // }catch(err){
  //   res.json({status:"failure",msg:"unable to update user details",err:err,});
  // }
});

app.delete("/deleteProfile",upload.none(), async(req,res)=>{
console.log(req.body)

try{
  let deleteDetails = await User.deleteMany({email:req.body.email})
  res.json({status:"success",msg:"user deleted Successfully"})

}catch(err){
  res.json({status:"failure",msg:"unable to delete user",err:err})
}


})

// app.post("/login",upload.none(),
// async(req,res)=>{
// console.log(req.body);

// // res.json("some dummy")
// let userDetails = await User.find().and({email:req.body.email});
// console.log(userDetails);

//    if(userDetails.length>0){
//     if(userDetails[0].password == req.body.password){

// let userDataToSend = {

// }

// res.json({status:"Success",data:userDataToSend})
//     } else {
//         res.json({status:"Failure",msg:"Invalid Password"});
//     }
//    } else {
//     res.json({status:"Failure",msg:"User does not exist"})
// }
// });

app.listen(process.env.port, () => {
  console.log(`Listening to port ${process.env.port}`);
});

let connectToMDB = async () => {
  try {
     await mongoose.connect(
        "mongodb+srv://yohangaddam10:yohangaddam10@cluster0.j0nzimo.mongodb.net/YohanDB?retryWrites=true&w=majority&appName=Cluster0"
      );

    // await mongoose.connect(process.env.mdburl);

    // await mongoose.connect("mongodb://localhost:6308/users");

    console.log("Successfully connected to MDB`");
  } catch (error) {
    console.log(error);
    console.log("unable to connect to MDB");
  }
};
connectToMDB();
