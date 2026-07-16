const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/ai.controller');

const router = express.Router();
router.use(auth);

router.post('/chat', ctrl.chatWithAI);
router.get('/insights', ctrl.getPredictiveInsights);

module.exports = router;
