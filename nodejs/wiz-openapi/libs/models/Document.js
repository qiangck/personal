var Document = {
	parseList: function (docList) {
		if (!docList) {
			return;
		}
		var parsedList = [];
		try {
			docList.forEach(function (doc) {
				if (typeof doc === 'string') {
					doc = JSON.parse(doc);
				}
				doc.dt_modified && (doc.dt_modified = new Date(doc.dt_modified));
				doc.dt_data_modified && (doc.dt_data_modified = new Date(doc.dt_data_modified));
				doc.dt_created && (doc.dt_created = new Date(doc.dt_created));
				parsedList.push(doc);
			});
			return parsedList;
		} catch (error) {
			//不处理，直接抛到service来处理
			throw error;
		}
	}
};

module.exports = Document;