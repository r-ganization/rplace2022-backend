import mysql from 'mysql2';
import config from 'config';
import logger from '../utils/logger';

const sql_database:string = config.get<string>('sql_database');
const sql_host:string     = config.get<string>('sql_host');
const sql_password:string = config.get<string>('sql_password');
const sql_username:string = config.get<string>('sql_username');


const connection:mysql.Connection = mysql.createConnection({
	host     : sql_host,
	user     : sql_username,
	password : sql_password,
	database : sql_database,
});


logger.info(`Connected to database`);


/**
 * @example 
 * query('SELECT * FROM table WHERE a = 1 AND b = 2')
 * query('SELECT * FROM table WHERE a = ? AND b = ?',[1,2])
 * 
 * @param sql The SQL command. `?` can be used as placeholders
 * @param values Data to replace `?`
 * @returns A promise that will return the results as an array of objects
 */
function query(sql:string, values?:any) {
	return new Promise((resolve,reject)=>{
		connection.execute(sql,values,(err,data)=>{
			if (err) {
				logger.error(err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export default {query};