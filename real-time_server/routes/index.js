var express = require('express');
var router = express.Router();
let chatroom_service = require('../component/chatroom');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/chatlist', async(req,res) => {
  let result = await chatroom_service.roomlist();
  res.json(result);
})

module.exports = router;
