//@ts-check
require('dotenv').config();

const { readFile, writeFile, appendFile } = require('fs/promises');
const https = require('https');

const { solver } = require('./solver');



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

    const outPath = process.env.OUT_FILE.replace('{date}', getDate());


    if (process.env.MODE === 'all') {
        for (const answer of answers) {
            if (process.env.VERBOSE) console.log(`Solve: ${answer}`);
            const result = solve(answer);
            if (process.env.VERBOSE) console.log(`Result: ${result}`);
            appendFile(outPath, result + '\n');
        }
    } else {
        const count = parseInt(process.env.MODE, 10);

        for (let i = 0; i < count; i++) {
            const answer = answers.splice(Math.floor(Math.random() * answers.length), 1)[0];
            if (process.env.VERBOSE) console.log(`Solve: ${answer}`);
            const result = solve(answer);
            if (process.env.VERBOSE) console.log(`Result: ${result}`);
            appendFile(outPath, result + '\n');
        }
    }




    // solveLine('hello', 'hello');
    // solveLine('hello', 'helno');
    // solveLine('hello', 'heleo');
    // solveLine('hello', 'helol');
    // solveLine('hello', 'hwlol');

    console.log(`Result written to ${outPath}`);
}


function solve(answer) {
    /** @type {string} */
    const result = solver(answer, solveLine, Number(process.env.TRIALS));

    if (lastWordOf(result) !== answer) {
        return 'X';
    }

    return result;
}

function solveLine(answer, guess) {
    answer = answer.split('');
    guess = guess.split('');
    let feedback = '⬜⬜⬜⬜⬜'.split('');// 🟩🟨⬜
    let used = [0, 0, 0, 0, 0];


    // green 🟩
    for (let i = 0; i < 5; i++) {
        if (answer[i] === guess[i]) {
            feedback[i] = '🟩';
            used[i] = 1;
        }
    }

    // yellow 🟨
    for (let i = 0; i < 5; i++) { // for each guess:
        if (feedback[i] === '🟩') continue; // skip green guess

        // else: result[i] == 🟨 or ⬜
        for (let j = 0; j < 5; j++) { // for each guess, match against unused answers:
            if (used[j] === 1) continue; // skip used answer

            if (answer[j] === guess[i]) { // this guess matches an unused answer
                // @ts-ignore
                feedback[i] = '🟨';
                used[j] = 1;
            }
        }
    }

    // else they are white ⬜


    if (process.env.VERBOSE) console.log(` - solveLine(${answer.join('')}, ${guess.join('')}) = ${feedback.join('')}`);
    return feedback.join('');
}

// UTILS

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