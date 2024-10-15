const express = require('express')
const { protect } = require('../Auth/protect')
const { accessChat, fetchChat,createGroupChat, updateGroupName, addUserToGroup, removeUserfromGroup } = require('../crud/chatCrud')

const router = express.Router()

router.route('/').post(protect,accessChat)
router.route('/').get(protect,fetchChat)
router.route('/group').post(protect,createGroupChat)
router.route('/rename').put(protect,updateGroupName)
router.route('/adduser').put(protect,addUserToGroup)
router.route('/removeuser').put(protect,removeUserfromGroup)
module.exports = router