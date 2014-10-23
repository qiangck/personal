function DeletedItem(type, version, deletedGuid) {
	this.guid_type = type;
	this.version = version;
	this.deleted_guid = deletedGuid;
	// this.dt_deleted = new Date().toISOString();
};

module.exports = DeletedItem;