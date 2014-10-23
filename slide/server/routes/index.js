var express = require('express');
var url = require('url');
var fs = require('fs');
var router = express.Router();
var dbService = require('../libs/db/dbService');
var SqlHelper = require('../libs/db/SqlHelper');
var connection = dbService.connection;

/* GET home page. */
router.post('/work', function(req, res) {
   res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var responseJson = {};
    var data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
    var name = req.body.name;
    var praise =  0;
    console.log(req.body)
    if(!name) {
        responseJson = {
            message: 'need name',
            status: 'error'
        }
        res.write(JSON.stringify(responseJson));
        res.end();
        return;
    }

    var queryStr = SqlHelper.createWork(name, praise, connection);
    dbService.query(queryStr, function(error, value) {
        if (error) {
            console.log('dbService.query error');
            console.log(error);
            responseJson = {
                message: error.message || error,
                status: 'error'
            }
            res.write(JSON.stringify(responseJson));
            res.end();
            return;
        }
        var workId = value.insertId;
        var imageName = workId + '.png';
        var imagePath = '/Users/rechie/WebstormProjects/personal/slide/server/public/images/' + imageName;
        fs.writeFile(imagePath, data, 'base64', function(error, value) {
            if (error) {
                console.log('fs.writeFile error');
                console.log(error);
                responseJson = {
                    message: error.message || error,
                    status: 'error'
                }
                res.write(JSON.stringify(responseJson));
                res.end();
                return;
            }
            var imgPath = '/images/' + imageName;
            responseJson = {
                path: imgPath,
                status: 'success',
                id: workId,
                message: 'success'
            }
            res.write(JSON.stringify(responseJson));
            res.end();
        });
    });
});
router.get('/work', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var responseJson = {};
    var queryStr = SqlHelper.queryWorksByPage(0, 50);
    console.log(queryStr)
    dbService.query(queryStr, function(error, value) {
        if (error) {
            console.log('get work dbService.query error');
            console.log(error);
            responseJson = {
                message: error.message || error,
                status: 'error'
            }
            res.end(JSON.stringify(responseJson));
            return;
        }
        console.log(value);
        responseJson = {
            works: value,
            status: 'success',
            message: 'success'
        }
        res.end(JSON.stringify(responseJson));

    });
});
router.get('/work/count', function(req, res){
    res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    var responseJson = {};
    var queryStr = SqlHelper.queryWorksCount();
    dbService.query(queryStr, function(error, value) {
        if (error) {
            console.log('get work count dbService.query error');
            console.log(error);
            responseJson = {
                message: error.message || error,
                status: 'error'
            };
            res.end(JSON.stringify(responseJson));
            return;
        }
        responseJson = {
            num: value[0]['COUNT(*)'],
            status: 'success',
            message: 'success'
        }
        res.end(JSON.stringify(responseJson));

    });
})

module.exports = router;
