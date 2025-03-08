const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Regular chat endpoint
router.post('/', chatController.sendMessage);

// Streaming chat endpoint
router.post('/stream', chatController.streamMessage);

module.exports = router;
