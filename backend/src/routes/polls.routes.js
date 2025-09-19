const router = require('express').Router();
const Poll = require('../models/Poll');

// Список последних опросов (можно фильтровать по chatId)
router.get('/', async (req, res, next) => {
  try {
    const { chatId, limit = 20 } = req.query;
    const q = chatId ? { chatId: Number(chatId) } : {};
    const items = await Poll.find(q).sort('-createdAt').limit(Math.min(+limit, 100));
    res.json(items);
  } catch (e) { next(e); }
});

// Один опрос по chatId+messageId
router.get('/:chatId/:messageId', async (req, res, next) => {
  try {
    const { chatId, messageId } = req.params;
    const doc = await Poll.findOne({ chatId: Number(chatId), messageId: Number(messageId) });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

module.exports = router;
