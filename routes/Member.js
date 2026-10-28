const express = require('express');
const router = express.Router();
const memberController = require('../controllers/Member')

router.get('/', memberController.index);
//router.get('/new', memberController.newForm);
//router.post('/', memberController.create);
//router.get('/:id', memberController.show);


module.exports = router;