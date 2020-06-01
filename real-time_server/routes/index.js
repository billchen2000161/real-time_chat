var express = require('express');
var router = express.Router();
let chatroom_service = require('../component/chatroom');
var savefile = require('../component/file');

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
      return res.json({datatype: 0});
    }
    res.json({ datatype: 1});
  });
})

router.get('/download', (req, res) => {
  console.log(req.query.filename);
  let file = 'public/file/'+req.query.filename;
  res.download(file);
})

module.exports = router;
