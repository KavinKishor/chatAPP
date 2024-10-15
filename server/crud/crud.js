const User = require("../schemas/Logschema.js");
const bcrypt = require("bcrypt");
const asynchandler = require("express-async-handler");
const generatetoken = require("../Auth/Jwt.js");

let getUsers = async (req, res) => {
  const user = await LogSchema.find({});
  res.json(user);
};

let createUsers = asynchandler(async (req, res) => {
  const hassed = await bcrypt.hash(req.body.password, 7);
  const adduser = User({ ...req.body, password: hassed });
  const token = generatetoken(adduser._id);
  await adduser.save();
  res.json({
    token,
    msg: "new user created",
    _id: adduser._id,
    name: adduser.name,
    email: adduser.email,
    isAdmin: adduser.isAdmin,
    pic: adduser.pic,
  });

  // const {name,email,password,pic} = req.body
  // if(!name||!email||!password){
  //     res.status(400).json('please enter all fields')
  // }
  // const userduplicate = await User.findOne({email})
  // if(userduplicate){
  //     res.json('user already found')
  // }
  // const user = await User.create({name,email,password,pic})
  // const token = generatetoken(user._id)
  // if(user&&token){
  //     return res.status(201).json({user,token,message:'User created successfully'})
  // }else{
  //     res.status(400).json('falied to create user')
  // }
});

let logginuser = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json("User Email is not Created");

  const userPassword = await bcrypt.compare(password, user.password);
  if (!userPassword) return res.json("user password doesn't match");
  const token = generatetoken(user._id);
  res.json({
    msg: "User Logged successfully",
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    pic: user.pic,
  });
});

let allUsers = asynchandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = { getUsers, createUsers, logginuser, allUsers };
