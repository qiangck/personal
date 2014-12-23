var redis = require("redis"),
  client = redis.createClient();      //这里可以多开几个redis的链接，类似进程池的概念

client.on("error", function (err) {
  console.log("Error " + err);
});


function addSet(key, value) {
	client.sadd(key, value, function(error, data) {
		if (error) {
			console.log('addSet Error: key=' + key + '; value=' + value);
		}
	});
}


var Redis = {
	//删除key
	deleteKey: function (key) {
		client.del(key, function(error, value){
			if(error) {
				console.log('redis.deleteKeys Error, key=' + key);
				console.log(error);
			}
		});
	},
	// 批量删除key
	deleteKeys: function(keys) {
		console.log('deleteKeys: ' + keys);
		try {
			Redis.getKeys(keys, function(value) {
				console.log(value);
				var i = 0, length = value.length;
				for (; i<length ; i++) {
					Redis.deleteKey(value[i]);
				}
			});
		} catch(err) {
			console.log('deleteKeys Error: keys ' + keys);
			console.log(err);
		}
	},

	expire: function (key) {
		client.expire(key, 10 * 60);
	},
	//把list中的内容保存到set中
	// 异步的
	addListToSet: function (key, list) {
		if (!list) {
			return;
		}
		var listLength = list.length;
		var index;
		try {
			for (index = 0; index < listLength; index++) {
				var value = list[index];
				addSet(key, JSON.stringify(value));
			}
			//暂时不设置超时时间
			// Redis.expire(key);
		} catch (error) {
			//出错的话，直接删除当前key，否则容易造成数据不完整
			console.log('Redis.addListToSet() Error: ' + error);
			// Redis.deleteKey(key);
			return;
		}
	},

	//获取set集合
	getSet: function (key, callback) {
		var members = client.smembers(key, function (error, data) {
			if (error) {
				//TODO
				console.log('Redis.getSet() Error: ' + error);
				return;
			}
			callback(data);
		});
	},

	setString: function (key, value) {
		client.set(key, value, function(error, data) {
			if (error) {
				// 检测错误问题
				console.log('redis setString Error; key=' + key + '; value=' + value );
				console.log(error);
			}
		});
	},

	getString: function (key, callback) {
		client.get(key, function (err, value) {
			callback(value);
		});
	},

	getKeys: function (key, callback) {
		client.keys(key, function(err, value) {
			callback(value);
		});
	},

	//判断key是否存在
	exists: function (key, callback) {
		client.exists(key, function (error, value) {
			var bExists = false;
			if (!error) {
				bExists = value ? true : false;
			}
			callback(bExists);
		});
	}


};

module.exports = Redis;

