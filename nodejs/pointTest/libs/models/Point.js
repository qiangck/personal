/**
 * Created with JetBrains WebStorm.
 * User: Rechie
 * Date: 13-9-16
 * Time: 下午14:47
 * To change this template use File | Settings | File Templates.
 */

var Util = require('../Util');
var SqlHelper = require('../SqlHelper');
var dbService = require('../dbService');
var connection = dbService.connection;
function Point(info) {
	this.point_num = info.number || -1;
	this.point_from = info.from;
	this.point_to = info.to;
    this.dt_created = Util.getCurDateStr();
    this.point_status = info.point_status || 1;
}

Point.prototype.update = function(info, callback) {

}

Point.update = function(pointList, callback) {
	var queryStr = SqlHelper.getInsertPointListQuery(pointList, connection);
    dbService.query(queryStr, callback);
};

Point.get = function(filter, callback) {
	var queryStr = SqlHelper.getSelectPointListQuery(filter, connection);
	console.log(queryStr);
    dbService.query(queryStr, callback);
};

Point.delete = function(pointId, callback) {
	var queryStr = SqlHelper.getDeletePointQuery(pointId, connection);
	dbService.query(queryStr, callback);
}

module.exports = Point;