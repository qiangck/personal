var express = require('express');
var url = require('url');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res) {

  res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var responseJson = {};
    var data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
    var imageName = Date.parse(new Date()) + '.png';
    var imagePath = '/Users/rechie/WebstormProjects/personal/slide/server/public/images/' + imageName;
    fs.writeFile(imagePath, data, 'base64', function(error, value) {
        if (error) {
            console.log('fs.writeFile error');
            console.log(error);
            responseJson = {
                message: error.message || error,
                status: 'error'
            }
            res.end(JSON.stringify(responseJson));
            return;
        }
        var imgPath = '/images/' + imageName;
        responseJson = {
            path: imgPath,
            status: 'success',
            message: 'success'
        }
        res.end(JSON.stringify(responseJson));
    });
});

module.exports = router;
