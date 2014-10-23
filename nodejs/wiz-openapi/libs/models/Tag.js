function Tag() {

};


Tag.getChildList = function (tagList, rootValue) {
	if (!tagList) {
		return;
	}
	var childList = [];
	tagList.forEach(function (tag) {
		if (typeof tag === 'string') {
			tag = JSON.parse(tag);
		}
		if (rootValue === tag.tag_group_guid)	 {
			childList.push(tag);
		}
	});
	return childList;
};

Tag.parseData = function (tagList) {
	if (!tagList) {
		return;
	}
	var map = {};
	var sortList = [];
	tagList.forEach( function (tag) {
		map[tag.tag_guid] = tag;
	});

	tagList.forEach( function (tag) {
		var parentGuid = tag.tag_group_guid;
		var parent = map[parentGuid];
		if (parent) {
			parent.isParent = true;
		}
		sortList.push(tag);
	});
	return sortList;
};

// 深度查找
Tag.getAllChildList = function(tagList, rootValue) {
	if (!tagList) {
		return;
	}
	var childList = [];
	tagList.forEach(function (tag) {
		if (typeof tag === 'string') {
			tag = JSON.parse(tag);
		}
		if (rootValue === tag.tag_group_guid)	 {
			childList.push(tag);
			childList = childList.concat(Tag.getAllChildList(tagList, tag.tag_guid));
		}
	});
	return childList;
};

exports.parseData = Tag.parseData;
exports.getChildList = Tag.getChildList;
exports.getAllChildList = Tag.getAllChildList;