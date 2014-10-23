'use strict';
var limit = require('../../conf/config').limit;

var LimitService = {
	regLimitList: {},
	loginLimitList : {},
	addRecord : function (ip, type) {
		var record = LimitService.getRecord(ip, type);
		record.add();
		//增加记录后把record放到listObj中
		if ('login' === type) {
			LimitService.loginLimitList[ip] = record;
		} else if ('register' === type) {
			LimitService.regLimitList[ip] = record;
		}
	},
	removeRecord : function(ip, type) {
		if ('login' === type) {
			delete LimitService.loginLimitList[ip];
		} else if ('register' === type) {
			delete LimitService.regLimitList[ip];
		}
	},
	isOverLimit : function (ip, type) {
		var record = LimitService.getRecord(ip, type);
		return record.isOverLimit();
	},
	getRecord : function(ip, type) {
		var record = null;
		if ('login' === type) {
			record = LimitService.loginLimitList[ip];
		} else if ('register' === type) {
			record = LimitService.regLimitList[ip];
		}
		if (!record) {
			record = new RecordNew(type);
		}
		return record;
	}
};

/*------------------------------------------------------------*/ 
//新方法，只记录最后一次出错时间和计数
//如果出错时间和上一次出错时间大于规定的时间，则计数清零
//否则计数++，直到大于限制的次数
function RecordNew(type) {
	this._count = 0;//初始化计数
	this._lastDate = null;
	if ('login' === type) {
		this._limitCount = limit.LOGIN_ERR_TIME;
	} else if ('register' === type) {
		this._limitCount = limit.REGISTER_ERR_TIME;
	}
}

RecordNew.prototype.add = function () {
	var curDate = new Date();
	if (this._lastDate !== null && curDate - this._lastDate >= limit.INTERVAL_MS) {
		this._count = 0;
	} else {
		this._count ++;
	}
	this._lastDate = curDate;
};

RecordNew.prototype.isOverLimit = function () {
	var curDate = new Date();
	if (this._lastDate !== null && curDate - this._lastDate >= limit.INTERVAL_MS) {
		this._count = 0;
		return false;
	} 
	if (this._count >= this._limitCount) {
		return true;
	}
	return false;
};
exports.addRecord = LimitService.addRecord;
exports.isOverLimit = LimitService.isOverLimit;
exports.removeRecord = LimitService.removeRecord;


