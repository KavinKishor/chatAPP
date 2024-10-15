const asyncHandler = require("express-async-handler");
const Message = require('../schemas/messagemoudle')
const User = require("../schemas/Logschema");
const Chat = require("../schemas/Chatmodel");

const sendMessage = asyncHandler(async(req,res)=>{

const {content,chatId} = req.body

if(!content || !chatId){
    return res.status(401).json({success:false,message:"Message and chat is not present"})
}

var newMessage = {
    sender: req.user._id,
    content: content,
    chat:chatId,
}

try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender","name pic")
    message = await message.populate("chat")
    message = await User.populate(message,{
        path:"chat.users",
        select:"name email pic"
    })

    await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage:message});
    res.json(message)
} catch (error) {
    res.status(401)
    throw new Error(error.message)
}

})


const allMessages = asyncHandler(async(req,res)=>{
    try {
        const messages = await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat")
        res.json(messages)
        
    } catch (error) {
        res.json(401)
        throw new Error(error.message)
    }
})
module.exports={sendMessage,allMessages}