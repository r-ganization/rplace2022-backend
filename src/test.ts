import logger from './utils/logger'; logger.level = 'silent';
import conn from './utils/connect';

let totalTests  = 0;
let passedTests = 0;
let failedTests = 0;
let totalTime   = 0;

let sectionTests  = 0;
let sectionPassed = 0;
let sectionFailed = 0;
let sectionTime   = 0;

const queue:(()=>void)[] = [];
let addEmptyLine:boolean;
let longestLine:number;
let section:string;

const TEST_ASYNC     = true;
const PRINT_PASSING  = true;
const PRINT_EXPECTED = true;
const PRINT_ERRORS   = true;
const PRINT_TIME     = true;
const PRINT_WIDTH    = 60;

////////////////////////////////////////////////
//                    Tests                   //
////////////////////////////////////////////////

testSection('conn');
runTest('selectTile',[
	{id:0, time:262431577, user_id:0, color:11, x: 826, y:1048},
	{id:1, time:262433758, user_id:1, color:17, x: 583, y:1031},
	{id:2, time:262434685, user_id:2, color:16, x:1873, y:558},
	{id:3, time:262497541, user_id:3, color:10, x:1627, y:255},
	{id:4, time:262516307, user_id:4, color:17, x:  49, y:1478}],
	()=>conn.query('SELECT * FROM tiles LIMIT 5'));

runTest('selectTile_id0',
	[{id:0, time:262431577, user_id:0, color:11, x:826, y:1048}],
	()=>conn.query('SELECT * FROM tiles WHERE id = 0'));

runTest('selectTile_time346440207',
	[{id:160455378, time:346440207, user_id:583562, color:31, x:0, y:1999}],
	()=>conn.query('SELECT * FROM tiles WHERE time = 346440207'));

runTest('selectTile_user123456',[
	{id:146155, time:263057930, user_id:123456, color:27, x:1523, y:1748},
	{id:301270, time:263359803, user_id:123456, color: 6, x:1527, y:1748},
	{id:630603, time:265128058, user_id:123456, color: 1, x:1547, y:1674},
	{id:650025, time:264526777, user_id:123456, color: 1, x:1539, y:1674},
	{id:678329, time:264827976, user_id:123456, color: 1, x:1541, y:1674}],
	()=>conn.query('SELECT * FROM tiles WHERE user_id = 123456 LIMIT 5'));

runTest('selectTile_color0',[
	{id:492894, time:262506839, user_id:333346, color:0, x:1797, y:1843},
	{id:492895, time:262546797, user_id:333347, color:0, x: 779, y:1093},
	{id:492896, time:262565750, user_id:195947, color:0, x:1823, y:1851},
	{id:492897, time:262570303, user_id:333348, color:0, x:1842, y:1850},
	{id:492898, time:262577908, user_id:302768, color:0, x:1824, y:1852}],
	()=>conn.query('SELECT * FROM tiles WHERE color = 0 LIMIT 5'));

runTest('selectTile_x0y0',[
	{id:1292, time:262433684, user_id:1272, color:16, x:0, y:0},
	{id:2159, time:263538616, user_id:2110, color:16, x:0, y:0},
	{id:2286, time:264842497, user_id:2232, color:17, x:0, y:0},
	{id:2789, time:264959035, user_id:2718, color:16, x:0, y:0},
	{id:6128, time:263555185, user_id:5770, color:16, x:0, y:0}],
	()=>conn.query('SELECT * FROM tiles WHERE x = 0 AND y = 0 LIMIT 5'));

printResults();

////////////////////////////////////////////////
//              Helper Functions              //
////////////////////////////////////////////////

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Runs a test
 * @param name The name of the test you are running
 * @param expectedResult What result you expect the scenario to return
 * @param scenario A function that will return a value to be tested
 */
function runTest(name:string, expectedResult:any, scenario:()=>any) {

	const width = section.length + name.length + (PRINT_TIME?20:8);
	if (width > (longestLine??PRINT_WIDTH)) longestLine = width;


	if (TEST_ASYNC) {
		// begin running test then add to queue

		// eslint-disable-next-line no-async-promise-executor
		const test = new Promise<{value:any,time:number}>(async (resolve)=>{
			const timer1 = performance.now();
			try {
				const result = await scenario();
				const timer2 = performance.now();
	
				resolve({value: result, time: timer2 - timer1});
			} catch (error) {
				const timer2 = performance.now();
				resolve({value: error, time: timer2 - timer1});
			}
		});

		queue.push(async ()=>{
			const testResults = await test;
			printTest(name, testResults.time, expectedResult, testResults.value);
		});
	} else {
		// add to queue and run test later
		queue.push(async ()=>{
			const timer1 = performance.now();
			try {
				const result = await scenario();
				const timer2 = performance.now();
	
				printTest(name, timer2 - timer1, expectedResult, result);
			} catch (error) {
				const timer2 = performance.now();
				printTest(name, timer2 - timer1, expectedResult, error);
			}
		});
	}
}

// ANSI escape codes are used for formatting.
// You can learn more about them here:
// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

/**
 * Allows different test sections
 * @param name The name of the section
 */
function testSection(name:string) {
	section = name + '_';
	queue.push(()=>{
		totalTests  += sectionTests;
		passedTests += sectionPassed;
		failedTests += sectionFailed;
		totalTime += sectionTime;

		if (section != '_') {
			if (!PRINT_PASSING && sectionFailed == 0) {
				console.log();
				console.log(`\x1b[1;32m${centerText('All Passed',' ')}\x1b[0m`);
				console.log();
			}


			//console.log('\x1b[1m-------- Section Results --------\x1b[0m');
			console.log(`\x1b[1m${centerText(' Section Results ', '-')}\x1b[0m`);

			console.log(formatData(sectionTests, sectionPassed, sectionFailed, sectionTime));

			console.log();
			console.log();
			console.log();
		}

		if (name != '')
			console.log(`\x1b[1m${centerText( ` ${name} `, '-')}\x1b[0m`);

		section = name + '_';
		addEmptyLine = false;
		sectionTests  = 0;
		sectionPassed = 0;
		sectionFailed = 0;
		sectionTime = 0;
	});
}

/**
 * Prints all the results of the tests
 */
async function printResults() {
	longestLine = longestLine??PRINT_WIDTH;
	testSection('');
	for (let i = 0; i < queue.length; i++) await queue[i]();

	console.log('\x1b[1;37m'+centerText(' Final Results ', '-')+'\x1b[0m');
	console.log(formatData(totalTests, passedTests, failedTests, totalTime));
	console.log(`\x1b[1m${'-'.repeat(longestLine)}\x1b[0m`)

	if (failedTests > 0) process.exitCode = 1;
}

/**
 * Prints result of test
 * @param name The name of the test
 * @param time How long the test took in ms
 * @param expectedResult What result you expect from the test
 * @param result 
 */
function printTest(name:string, time:number, expectedResult:any, result:any) {
	const success = equal(expectedResult,result);
	const timeStr = PRINT_TIME?`    ${(time/1000).toFixed(2).padStart(7)}s`:'';
	const nameStr = (section + name).padEnd(longestLine - (PRINT_TIME?20:8));

	if (addEmptyLine) {
		console.log();
		addEmptyLine = false;
	}

	if (success && PRINT_PASSING) {
		console.log(`\x1b[32m${nameStr}${timeStr}\x1b[1m    PASS\x1b[0m`);
	} else if (!success) {
		console.log(`\x1b[31m${nameStr}${timeStr}\x1b[1m    FAIL\x1b[0m`);

		if (PRINT_ERRORS && result instanceof Error) {
			let errorMsg = result.stack.split('\n');

			if (PRINT_EXPECTED) {
				console.log('           \x1b[31mExpected:\x1b[0m',stringify(expectedResult));

				// Match format of expected: received:
				errorMsg[0] = '\x1b[31mReceived:\x1b[0m ' + errorMsg[0];
			}

			errorMsg = errorMsg.map(x=>'           '+x);

			console.log(errorMsg.join('\n'));
			addEmptyLine = true;
		} else if (PRINT_EXPECTED) {
			console.log('           \x1b[31mExpected:\x1b[0m',stringify(expectedResult));
			console.log('           \x1b[31mReceived:\x1b[0m',stringify(result));
			addEmptyLine = true;
		}
	}

	sectionTests += 1;
	sectionTime += time;

	if (success) sectionPassed += 1;
	else         sectionFailed += 1;
}

/**
 * Centers text
 * @param text The text to be centered
 * @param char The char to be surrounding the text
 * @returns The centered text
 */
function centerText(text:string, char:string):string {
	const paddingSize = (longestLine - text.length) / 2;

	if (paddingSize < 0) return text;

	return char.repeat(Math.ceil(paddingSize))+text+
		char.repeat(Math.floor(paddingSize));
}

/**
 * Formats data for easy reading
 * @param total Total number of tests
 * @param passed How many tests passed
 * @param failed How many tests failed
 * @param time How long the tests took
 * @returns Formatted string
 */
function formatData(total:number, passed:number, failed:number, time:number):string {
	const percent = (100 * passed / total).toFixed(1);
	const timeF = (time/1000).toFixed(2);

	let res = `\x1b[1;33mTests: ${total}`
	let width = 7 + total.toString().length;
	
	if (width + passed.toString().length + percent.length + 13 > longestLine) {
		width = passed.toString().length + percent.length + 12;
		res += `\n\x1b[32mPassed: ${passed} (${percent}%)`; 
	} else {
		width += passed.toString().length + percent.length + 13;
		res += ` \x1b[32mPassed: ${passed} (${percent}%)`;
	}

	if (width + failed.toString().length + 9 > longestLine) {
		width = failed.toString().length + 8;
		res += `\n\x1b[31mFailed: ${failed}`; 
	} else {
		width += failed.toString().length + percent.length + 9;
		res += ` \x1b[31mFailed: ${failed}`;
	}

	if (width + timeF.toString().length + 8 > longestLine && PRINT_TIME) {
		width = failed.toString().length + 7;
		res += `\n\x1b[34mTime: ${timeF}s`; 
	} else if (PRINT_TIME) {
		width += failed.toString().length + percent.length + 8;
		res += ` \x1b[34mTime: ${timeF}s`;
	}

	res += '\x1b[0m';
	return res;
}

/**
 * Converts anything to a string
 * @param value What you want to convert to a string
 * @returns A string that represents the input
 */
function stringify(value:any):string {
	if (value instanceof Error) return value.name + ': ' + value.message;
	if (typeof value == 'object') return JSON.stringify(value);
	if (value === null) return 'null'; 
	if (value === undefined) return 'undefined'; 
	return value.toString();
}

/**
 * Checks if two things are the same
 * @param value1 First value
 * @param value2 Second value
 * @returns Whether or not the values are the same
 */
function equal(value1:any, value2:any):boolean {
	if (typeof value1 != typeof value2) return false;

	if (value1 instanceof Error) {
		return value1.name == value2.name && 
			(value1.message == value2.message || value1.message == '');
	}

	if (typeof value1 == 'object') {
		const keys1 = Object.keys(value1).sort();
		const keys2 = Object.keys(value2).sort();

		if (keys1.length != keys2.length) return false;

		for (let i = 0; i < keys1.length; i++) {
			if (keys1[i] != keys2[i]) return false;
			if (!equal(value1[keys1[i]], value2[keys2[i]])) return false;
		}
		return true;
	}

	return value1 === value2;
}