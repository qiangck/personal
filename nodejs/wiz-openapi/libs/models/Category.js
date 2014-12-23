function Category() {
}

/**
 * 将categories字符串转换成List
 * @param  {string} categories 目录字符串，*分割
 * @param  {string} postionStr 选填项，目录位置信息
 * @return {[type]}            [description]
 */
Category.parseDate = function (categories, postionStr) {
	if (!categories || typeof categories !== 'string') {
		return [];
	}
	// 防止出现多个'/'
	categories = categories.replace(/\/+/g, '/');
	//用来存放 category-name的map
	var categoryMap = {},
			locationArray = categories.split('*'),
			tempLocation,
			//解析后单个文件夹的名称数组
			nameArr,
			//当前文件夹的父路径
			parentLocation,
			//存放在HashMap中的nodeData，防止重复
			mapNodeObj,
			//每个节点的数据
			nodeObj,
			//当前文件夹父节点的子节点数
			childCount,
			//
			categoryList = [],
			// 目录顺序信息
			positionJson;

	// 先处理顺序信息
	if (typeof postionStr !== 'string') {
		positionJson = null;
	} else {
		try {
			positionJson = JSON.parse(postionStr)
		} catch(error) {
			// 只记录，不做处理
			console.log('Category.parseDate Error: ' + error);
			positionJson = null;
		}
	}

	locationArray.sort(function (a, b) {
		return a.localeCompare(b);
	});
	locationArray.forEach(function (location, firstIndex) {
		if (location.length < 1) {
			return;
		}
		// 不能简单的concat，会有重复数据，应该判断后加入
		// lsl 2012-11-28
		// var childList = Category.parse(location);
		// categoryList = categoryList.concat(childList);
		tempLocation = '/';
		//把头尾的空串去掉
		if (location.charAt(0) === '/') {
			location = location.substr(1);
		}
		if (location.charAt(location.length -1) === '/') {
			location = location.substr(0, location.length -1);
		}
		nameArr = location.split('/');
		nameArr.forEach(function (name, levelIndex) {
			//记录路径
			parentLocation = tempLocation;
			tempLocation += name + '/';
			mapNodeObj = categoryMap[tempLocation];
			if (!mapNodeObj) {
				//根节点特殊处理
				nodeObj = {
					category_name : name,
					location : tempLocation,
					parentLocation: parentLocation,
					type: 'category'
				};
				if (positionJson !== null && positionJson[tempLocation]) {
					// 增加排序的信息
					nodeObj.position = positionJson[tempLocation];
				}
				categoryMap[tempLocation] = nodeObj;
			}
			// 解决父目录没有处理isParent的问题 lsl-2012-11-28
			mapNodeObj = categoryMap[tempLocation];
			if (levelIndex === nameArr.length - 1) {
				mapNodeObj.isParent = false;
			} else {
				mapNodeObj.isParent = true;
			}
		});
	});

	for (key in categoryMap) {
		categoryList.push(categoryMap[key]);
	}
	// console.log(categoryList);
	// return ztreeData;
	return categoryList;
};

/**
 * 处理单独的Category
 * @param  {string} location /a/b/c/
 * @return {[type]}             [description]
 */
Category.parse = function (location) {
	var categoryMap = {},
			tempLocation,
			locationLength,
			//解析后单个文件夹的名称数组
			nameArr,
			//当前文件夹的父路径
			parentLocation,
			//存放在HashMap中的nodeData，防止重复
			mapNodeObj,
			//每个节点的数据
			nodeObj,
			//
			categoryList = [];

	tempLocation = '/';
	locationLength = location.length;
	//把头尾的空串去掉
	nameArr = location.substr(1, locationLength - 2).split('/');
	nameArr.forEach(function (name, levelIndex) {
		//记录路径
		parentLocation = tempLocation;
		tempLocation += name + '/';
		mapNodeObj = categoryMap[tempLocation];
		if (!mapNodeObj) {
			//根节点特殊处理
			nodeObj = {
				category_name : name,
				location : tempLocation,
				parentLocation: parentLocation,
				type: 'category'
			};
			categoryMap[tempLocation] = nodeObj;
			if (levelIndex === nameArr.length - 1) {
				nodeObj.isParent = false;
			} else {
				nodeObj.isParent = true;
			}

			categoryList.push(nodeObj);
		}
	});
	return categoryList;
}

/**
 * 将categoryList 转换成字符串格式  只取location，用‘*’拼接
 * @param  {[type]} categoryList [description]
 * @return {[type]}              [description]
 */
Category.parseListToString = function (categoryList) {
	var categoryStr = '';
	if (categoryList.length < 1) {
		return categoryStr;
	}
	categoryList.forEach(function (category, index) {
		if (typeof category === 'string') {
			try {
				category = JSON.parse(category);	
			} catch (error) {
				console.log('Category.parseListToString Error: ' + error);
			}
		}
		if (categoryStr === '') {
			categoryStr = category.location;
		} else {
			categoryStr = categoryStr + '*' + category.location;
		}
	});
	return categoryStr;
}
/**
 * 从目录列表中获取到子目录列表
 * @param  {array} categoryList  全部目录列表
 * @param  {string} rootValue    父目录location
 * @return {[type]}              [description]
 */
Category.getChildList = function (categoryList, rootValue) {
	var childList = [];

	categoryList.forEach(function (category) {
		if (typeof category === 'string') {
			try {
				category = JSON.parse(category);
			} catch (error) {
				console.log('Category.getChildList parse Error: ' + error);
				// 忽略此项
				return;
			}
		}
		if (rootValue === category.parentLocation)	 {
			childList.push(category);
		}
	});
	return childList;
}

Category.exist = function(list, location) {
	var exist = false;
	list.forEach(function(obj, index) {
		if (typeof obj === 'string') {
			try {
				obj = JSON.parse(obj);
			} catch (error) {
				console.log('Category.rename parse Error: ' + error);
				// 忽略此项
				return;
			}
		}
		if(obj.location === location) {
			exist = true;
			// 这里不能直接调用return true
			// 这里return是跳出循环，而不知是直接返回了
		}
	});
	return exist;
}

Category.rename = function(list, oldLocation, newName) {
	var newList = [];
	list.forEach(function(obj, index){
		if (typeof obj === 'string') {
			try {
				obj = JSON.parse(obj);
			} catch (error) {
				console.log('Category.rename parse Error: ' + error);
				// 忽略此项
				return;
			}
		}
		if (obj.location === oldLocation) {
			obj.name = newName;
			obj.location = obj.parentLocation + newName + '/';
		}
		newList.push(obj);
	});
	return newList;
};

Category.delete = function(list, oldLocation) {
	var newList = [];
	list.forEach(function(obj, index){
		if (typeof obj === 'string') {
			try {
				obj = JSON.parse(obj);
			} catch (error) {
				console.log('Category.rename parse Error: ' + error);
				// 忽略此项
				return;
			}
		}
		if (obj.location !== oldLocation) {
			newList.push(obj);	
		}
	});
	return newList;
};

exports.parse = Category.parse;
exports.parseDate = Category.parseDate;
exports.parseListToString = Category.parseListToString;
exports.exist = Category.exist;
exports.getChildList = Category.getChildList;
exports.rename = Category.rename;
exports.delete = Category.delete;