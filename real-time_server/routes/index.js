var express = require('express');
var router = express.Router();
let chatroom_service = require('../component/chatroom');
var savefile = require('../component/file');
let history = require('../component/history_record');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/chatlist', async(req,res) => {
  let result = await chatroom_service.roomlist();
  res.json(result);
})

router.post('/upload', (req, res) => {
  savefile.save(req,res,function (err) {
    if (err) {
      console.log('can not save the file');
      return res.json({datatype: 0});
    }
    res.json({datatype: 1});
  });
})

router.get('/download', (req, res) => {
  console.log(req.query.filename);
  let file = 'public/file/'+req.query.filename;
  res.download(file);
})

router.post('/history', history)

module.exports = router;
