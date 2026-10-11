const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');

router.post('/register', upload.single('signature'), authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/signature', authenticate, upload.single('signature'), authController.updateSignature);

module.exports = router;
