const mssql = require('mssql')
require('dotenv').config();
const config = {
    user: process.env["DB_USER"],
    password: process.env["DB_PASS"],
    server: process.env["DB_SERVER"],
    database: process.env["DB_DATABASE"],
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}
let connectionPool;

var getConnection = async function () {//連線資料庫
    if (!(connectionPool && connectionPool.connected)) {
        connectionPool = await mssql.connect(config);
    }
    return connectionPool;
}
var querySql = async function (sql, params) {//寫sql語句自由查詢
    await mssql.close();// close
    var pool = await getConnection();
    var request = pool.request();
    if (params) {
        for (var index in params) {
            if (typeof params[index] == "number") {
                request.input(index, mssql.Int, params[index]);
            } else if (typeof params[index] == "string") {
                request.input(index, mssql.NVarChar, params[index]);
            }
        }
    }
    var result = await request.query(sql);
    await mssql.close();// close
    return result;
};

var add = async function (addObj, tableName, date) {//新增資料
    if (!addObj) {
        return;
    }
    await mssql.close();// close
    var connection = await getConnection();
    var request = connection.request();

    var sql = "insert into " + tableName + "(";
    for (var index in addObj) {
        if (typeof addObj[index] == "number") {
            request.input(index, mssql.Int, addObj[index]);
        } else if (typeof addObj[index] == "string") {
            request.input(index, mssql.NVarChar, addObj[index]);
        }
        else if (index == "recordtime") {
            request.input(index, mssql.DateTime, addObj[index]);
        }
        sql += index + ",";
    }
    sql = sql.substring(0, sql.length - 1) + ") values(";
    for (var index in addObj) {
        if (typeof addObj[index] == "number") {
            sql += "@" + index + ",";
        } else if (typeof addObj[index] == "string") {
            sql += "@" + index + ",";
        }
        else if (index == "recordtime") {
            sql += "@" + index + ",";
        }
    }
    sql = sql.substring(0, sql.length - 1) + ")";

    var result = await request.query(sql);
    await mssql.close();// close
    return result;
};

var update = async function (updateObj, whereObj, tableName) {//更新資料
    await mssql.close();// close
    var connection = await getConnection();
    var request = connection.request();

    var sql = "UPDATE " + tableName + " SET ";
    if (updateObj) {
        for (var index in updateObj) {
            if (typeof updateObj[index] == "number") {
                request.input(index, mssql.Int, updateObj[index]);
                sql += index + "[email protected]" + index + ",";
            } else if (typeof updateObj[index] == "string") {
                request.input(index, mssql.NVarChar, updateObj[index]);
                sql += index + "[email protected]" + index + ",";
            }
        }
    }
    sql = sql.substring(0, sql.length - 1) + " WHERE ";
    if (whereObj) {
        for (var index in whereObj) {
            if (typeof whereObj[index] == "number") {
                request.input(index, mssql.Int, whereObj[index]);
                sql += index + "[email protected]" + index + " AND ";
            } else if (typeof whereObj[index] == "string") {
                request.input(index, mssql.NVarChar, whereObj[index]);
                sql += index + "[email protected]" + index + " AND ";
            }
        }
    }
    sql = sql.substring(0, sql.length - 5);
    var result = await request.query(sql);
    await mssql.close();// close
    return result;
};
module.exports = {
    add,
    update,
    querySql
}