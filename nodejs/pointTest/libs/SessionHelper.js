
function SessionHelper() {

}

SessionHelper.prototype.userList = [];

SessionHelper.prototype.authorize = function(user) {
	var bChecked = false;
    this.userList.forEach(function(obj, index) {
        if(obj.user_id === user.user_id) {
            bChecked = true;
        }
    });
	return bChecked;
};

SessionHelper.prototype.add = function(user) {
	if (this.userList.indexOf(user) < 0) {
		this.userList.push(user);
	}
};

SessionHelper.prototype.delete = function(user) {
	var index = this.userList.indexOf(user);
	if (index > -1) {
		this.userList.splice(index, 1);
	}
};

module.exports = new SessionHelper();