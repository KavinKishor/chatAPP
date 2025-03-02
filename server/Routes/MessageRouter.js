const express = require('express')
const { protect } = require('../Auth/protect')
const { sendMessage, allMessages } = require('../crud/messageCRUD')


const router = express.Router()

router.route('/').post(protect,sendMessage)
router.route('/:chatId').get(protect,allMessages)

module.exports = router