


var SqlHelper = {

//INSERT INTO `canvas_server`.`works` (`id`, `name`) VALUES (<{id: }>, <{name: }>);
//SELECT `works`.`id`, `works`.`name` FROM `canvas_server`.`works` LIMIT 0, 100;
	createWork: function(name, praise, connection) {
		praise = praise || 0;
		var queryStr = 'INSERT INTO `canvas_server`.`works` (`name`) VALUES (' + connection.escape(name) + ');';
		return queryStr;
	},
	queryWorksAll: function() {
		var queryStr = 'SELECT `works`.`id`, `works`.`name` FROM `canvas_server`.`works` ';
		return queryStr;
	},
	queryWorksByPage: function(pageIndex, perPageNum, connection) {
		var queryStr = SqlHelper.queryWorksAll();
		queryStr += 'LIMIT ' + pageIndex*perPageNum + ', ' + (pageIndex+1)*perPageNum;
		return queryStr  
	},
    queryWorksCount: function() {
        var queryStr = 'SELECT COUNT(*)  FROM `canvas_server`.`works`';
        return queryStr;
    }
}


module.exports = SqlHelper;