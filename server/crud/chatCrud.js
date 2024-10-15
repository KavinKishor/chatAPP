const asynchandler = require("express-async-handler");
const Chat = require("../schemas/Chatmodel");
const User = require("../schemas/Logschema");

const accessChat = asynchandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not send with request");
    return res.sendStatus(400);
  }
  var isChat = await Chat.find({
    isGroupchat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupchat: false,
      users: [req.user._id, userId],
    };
    try {
      const createChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
      // console.error(error)
    }
  }
});

const fetchChat = asynchandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name email pic",
        });
        res.status(200).send(result);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asynchandler(async (req, res) => {
  if (!req.body.users && !req.body.name) {
    res.status(400).send({ message: "Please enter all fields" });
  }
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res
      .status(400)
      .send({ message: "More then 2 users needed to create a group" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupchat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateGroupName = asynchandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const rename = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("groupAdmin", "-password")
    .populate("users", "-password");

  if (!rename) {
    res.status(400);
    throw new Error(error.message);
  } else {
    res.status(200).json(rename);
  }
});

const addUserToGroup = asynchandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const addUser = await Chat.findByIdAndUpdate(
    chatId,
    { $push: {users:userId} },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addUser) {
    res.status(400);
    throw new Error(error.message);
  } else {
    res.status(200).json(addUser);
  }
});

const removeUserfromGroup = asynchandler(async(req,res)=>{
    const {chatId,userId} = req.body

    const removeUser = await Chat.findByIdAndUpdate(chatId,{$pull:{users:userId}},{new:true})
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(!removeUser){
        res.status(400)
        throw new Error(error.message)
    }else{
        res.status(200).json(removeUser)
    }
})

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  updateGroupName,
  addUserToGroup,
  removeUserfromGroup
};
