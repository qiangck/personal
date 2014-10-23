var Point = require('../libs/models/Point');
function grade() {
	var pointList = [{
		number: 9,
		from: '李树亮',
		to: '小三'
	}, {
		number: 4,
		from: '李树亮',
		to: '张三'
	}, {
		number: 1,
		from: '李树亮',
		to: '李四'
	}, {
		number: 1,
		from: '李树亮',
		to: '王五'
	}];
	var list = [];
	pointList.forEach(function(obj, index) {
		list.push(new Point(obj));
	})
	console.log(list);
	Point.update(list, function(error, data) {
		console.log('back');
		console.log(arguments);
	})
}

function getPoints() {
	var filter = {
		point_status: 2
	};
	Point.get(filter, function(error, data) {
		if (error) {
			console.log(error || error.message);
		} else {
			console.log(data);
		}
	});
}
getPoints();