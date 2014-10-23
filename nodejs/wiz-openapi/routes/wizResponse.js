var config = require('../conf/config');
var wizResponse = {
	initDefault: function(response) {
		response.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
		return response;
	},
	getResJson: function(error, value) {
		var responseJson = {};
		if (error) {
			if (error.faultCode && error.faultString) {
				responseJson = {'code': error.faultCode, 'message': error.faultString || error.message};
			} else {
				responseJson = {'code': 502, 'message': (typeof error === 'string') ? error: error.message};
			}
		} else {
			if (value && value.return_code && value.return_code != 200) {
				responseJson = {'code': value.return_code, 'message': value.return_message};
			} else if(value && value.err_code && value.err_code != 200) {
				responseJson = {'code': value.err_code, 'message': value.err_msg};
			} else{
				responseJson = {'code': 200, 'message': 'success'};
			}
		}
		return responseJson;
	}
};

module.exports = wizResponse;