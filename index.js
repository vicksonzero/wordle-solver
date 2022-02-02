//@ts-check

//#region head
require('dotenv').config();
if (process.env.SILENT) {
    process.env.VERBOSE = '';
    process.env.VERBOSE_SOLVER = '';
}

// lib
const { readFile, writeFile, appendFile } = require('fs/promises');
const https = require('https');
const seedrandom = require('seedrandom');
const rng = seedrandom(process.env.SEED, { global: true });
const { performance, PerformanceObserver } = require("perf_hooks")

// init
const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        appendFile(perfPath, JSON.stringify(entry, null, 4) + '\n');
        if (entry.name == 'all') {
            console.log(entry);
        }
    })
})
perfObserver.observe({ entryTypes: ["measure"], buffered: true });

// load solver
const { solver, name: solverName } = require(process.env.SOLVER);
console.log(`Using solver: ${process.env.SOLVER} (${solverName})`);

// init file names
const fileNameDate = getDate();
const outPath = process.env.OUT_FILE
    .replace('{date}', fileNameDate)
    .replace('{solver}', solverName.replace(/[^a-zA-Z0-9_]/g, '_'));
const perfPath = process.env.PERF_FILE
    .replace('{date}', fileNameDate)
    .replace('{solver}', solverName.replace(/[^a-zA-Z0-9_]/g, '_'));

//#endregion

//#region body
let answers = [];
let allWords = []; // allowed guesses and answers mixed, sorted

async function main() {
    performance.mark("all-start");
    await setup();
    // writeFileExt('./allWords.txt', allWords.join('\n'));

    const stats = {
        solver: solverName,
        minGuesses: allWords.length,
        maxGuesses: 0,
        fails: 0,
        guessesDetails: {},
        totalGuesses: 0,
    };


    if (process.env.MODE === 'all') {
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            if ((i + 1) % 10 === 0) console.log(`${i + 1}/${answers.length}`);
            solve(answer, outPath, stats);
        }
    } else if (process.env.MODE.length === 5) {
        solve(process.env.MODE, outPath, stats);
    } else {
        const count = parseInt(process.env.MODE, 10);
        for (let i = 0; answers.length > 0 && i < count; i++) {
            const answer = answers.splice(Math.floor(Math.random() * answers.length), 1)[0];
            solve(answer, outPath, stats);
        }
    }


    console.log(JSON.stringify(stats, null, 4));
    appendFile(outPath, `\n\n${JSON.stringify(stats, null, 4)}\n`);

    console.log(`Result written to ${outPath}`);
    performance.mark("all-end");
    performance.measure('all', "all-start", "all-end");
}

async function setup() {

    // set up
    answers = await (readFile(process.env.WORDLE_ANSWERS_PATH)
        .then(b => b.toString())
        .then(str => str.split('\n'))
    );
    if (process.env.VERBOSE) console.log(`answers: ${answers.length}`);
    const allowed = await (readFile(process.env.WORDLE_ALLOWED_GUESSES_PATH)
        .then(b => b.toString())
        .then(str => str.split('\n'))
    );
    if (process.env.VERBOSE) console.log(`allowed: ${allowed.length}`);
    allWords = [
        ...answers,
        ...allowed,
    ];
    if (process.env.VERBOSE) console.log(`allWords: ${allWords.length}`);
    allWords.sort((a, b) => a.localeCompare(b));
}
//#endregion

//#region runner


function solve(answer, outPath, stats) {
    if (process.env.VERBOSE) console.log(`Solve: ${answer}`);

    const measureKey = `${solverName}: ${answer}`;
    performance.mark("measure-start");

    /** @type {string} */
    let result = solver(answer, allWords.slice(), solveLine, Number(process.env.TRIALS));

    performance.mark("measure-end");
    performance.measure(measureKey, "measure-start", "measure-end");

    if (lastWordOf(result) !== answer) {
        result = 'X';
    }

    const steps = result.split(',').length;
    stats.minGuesses = Math.min(stats.minGuesses, steps);
    stats.maxGuesses = Math.max(stats.maxGuesses, steps);
    stats.fails += result === 'X' ? 1 : 0;
    stats.guessesDetails[steps] = (stats.guessesDetails[steps] || 0) + 1;
    stats.totalGuesses += steps;

    if (!process.env.SILENT) console.log(`Result (${steps}): ${result}\n`);
    appendFile(outPath, result + '\n');
}

function solveLine(answer, guess) {
    answer = answer.split('');
    guess = guess.split('');
    let feedback = '00000'.split(''); // 🟩🟨⬜ 210
    let used = [0, 0, 0, 0, 0];


    // green 2
    for (let i = 0; i < 5; i++) {
        if (answer[i] === guess[i]) {
            feedback[i] = '2';
            used[i] = 1;
        }
    }

    // yellow 1
    for (let i = 0; i < 5; i++) { // for each guess:
        if (feedback[i] === '2') continue; // skip green guess

        // else: result[i] == 1 or 0
        for (let j = 0; j < 5; j++) { // for each guess, match against unused answers:
            if (used[j] === 1) continue; // skip used answer

            if (answer[j] === guess[i]) { // this guess matches an unused answer
                // @ts-ignore
                feedback[i] = '1';
                used[j] = 1;
            }
        }
    }

    // else they are white 0


    if (process.env.VERBOSE) console.log(` - solveLine(${formatResult(answer)}, ${formatResult(guess)}) = ${formatResult(feedback)}`);
    return feedback.join('');
}
//#endregion

//#region utils


function formatResult(result) {
    // 🟩🟨⬜ 210
    return result.join('')
        .replace(/0/g, '⬜')
        .replace(/1/g, '🟨')
        .replace(/2/g, '🟩');
}

function lastWordOf(result = '') {
    var n = result.lastIndexOf(",");
    var res = result.substring(n + 1);
    return res;

}

function getDate() {
    return new Date().toISOString().split('.')[0].replace(/[-:]/g, '_');
}

async function writeFileExt(pathTemplate, data) {
    const path = pathTemplate.replace('{date}', getDate());
    await writeFile(path, data);
    console.log(`Written to ${path}`);
}

//#endregion



main();
