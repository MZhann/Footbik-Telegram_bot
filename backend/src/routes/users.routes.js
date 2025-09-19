// src/routes/users.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/user.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
