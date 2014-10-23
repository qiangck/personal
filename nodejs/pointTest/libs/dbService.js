/**
 * Created with JetBrains WebStorm.
 * User: Rechie
 * Date: 13-9-11
 * Time: 上午9:24
 * To change this template use File | Settings | File Templates.
 */
var mysql = require('mysql');
var config = {
    host     : 'localhost',
    user     : 'root',
    password : 'kelly1984',
    database: 'point_test'
};
var connection ;


handleDisconnect();
function DbService() {

}
DbService.connection = connection;
DbService.query = function(queryStr, callback) {
	connection.query(queryStr, callback);
};

function handleDisconnect() {
    connection = mysql.createConnection(config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}



module.exports = DbService;