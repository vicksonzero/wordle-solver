//@ts-check
require('dotenv').config();

const fileNameDate = getDate();
const outPath = process.env.OUT_FILE.replace('{date}', fileNameDate);
const perfPath = process.env.PERF_FILE.replace('{date}', fileNameDate);

const { readFile, writeFile, appendFile } = require('fs/promises');
const https = require('https');
const seedrandom = require('seedrandom');
const rng = seedrandom(process.env.SEED, { global: true });
const { performance, PerformanceObserver } = require("perf_hooks")

const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        appendFile(perfPath, JSON.stringify(entry, null, 4) + '\n');
    })
})
perfObserver.observe({ entryTypes: ["measure"], buffered: true });


const { solver, name: solverName } = require('./solver');



let answers = [];
let allWords = []; // allowed guesses and answers mixed, sorted
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




async function main() {
    await setup();


    if (process.env.MODE === 'all') {
        for (const answer of answers) {
            solve(answer, outPath);
        }
    } else {
        const count = parseInt(process.env.MODE, 10);
        for (let i = 0; i < count; i++) {
            const answer = answers.splice(Math.floor(Math.random() * answers.length), 1)[0];
            solve(answer, outPath);
        }
    }




    // solveLine('hello', 'hello');
    // solveLine('hello', 'helno');
    // solveLine('hello', 'heleo');
    // solveLine('hello', 'helol');
    // solveLine('hello', 'hwlol');

    console.log(`Result written to ${outPath}`);
}


function solve(answer, outPath) {
    if (process.env.VERBOSE) console.log(`Solve: ${answer}`);

    performance.mark("measure-start");

    /** @type {string} */
    let result = solver(answer, allWords.slice(), solveLine, Number(process.env.TRIALS));

    performance.mark("measure-end");
    performance.measure(`${solverName}: ${answer}`, "measure-start", "measure-end");

    if (lastWordOf(result) !== answer) {
        result = 'X';
    }


    if (process.env.VERBOSE) console.log(`Result: ${result}`);
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

// UTILS

function formatResult(result) {
    // 🟩🟨⬜ 210
    return result.join('')
        .replace(/0/g, '⬜')
        .replace(/1/g, '🟨')
        .replace(/2/g, '🟩');
}

function lastWordOf(result) {
    var n = result.indexOf(",");
    var res = result.substring(n + 1, -1);
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

main();