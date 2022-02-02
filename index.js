//@ts-check
require('dotenv').config();

const { readFile, writeFile, appendFile } = require('fs/promises');
const https = require('https');
let answers = [];
let allWords = []; // allowed guesses and answers mixed, sorted

async function main() {
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

    const outPath = process.env.OUT_FILE.replace('{date}', getDate());

    // const context = {

    // };
    // for (const answer of answers) {
    //     const result = solve();
    //     appendFile(outPath, result);
    // }


    solveLine('acorn', 'arise');
    solveLine('arise', 'acorn');
    solveLine('hound', 'arise');
    solveLine('acute', 'stuck');
    solveLine('acrss', 'stuck');
    solveLine('stuck', 'acrss');
    solveLine('perky', 'merry');
    console.log(`Result written to ${outPath}`);
}


function solve(context) {
    const {
        _answer,
        _result
    } = context;



    for (let i = 0; i < 6; i++) {
        const guess = '';
        solveLine(_answer, guess);
    }


    return '';
}

function solveLine(answer, guess) {
    answer = answer.split('');
    guess = guess.split('');
    let result = '⬜⬜⬜⬜⬜'.split('');// 🟩🟨⬜
    let used = [0, 0, 0, 0, 0];
    // green 🟩
    for (let i = 0; i < 5; i++) {
        if (answer[i] === guess[i]) {
            result[i] = '🟩';
            used[i] = 1;
        }
    }

    // yellow 🟨
    for (let i = 0; i < 5; i++) { // for each guess
        if (result[i] === '🟩') continue; // skip green guess

        // result[i] == 🟨 or ⬜
        for (let j = 0; j < 5; j++) {
            if (used[j] === 1) continue; // skip used answer

            if (answer[j] === guess[i]) {
                // @ts-ignore
                result[i] = '🟨';
                used[j] = 1;
            }
        }
    }


    console.log(`solveLine(${answer.join('')}, ${guess.join('')}) = ${result.join('')}`);
    return result.join('');
}

// UTILS

function getDate() {
    return new Date().toISOString().split('.')[0].replace(/[-:]/g, '_');
}

async function writeFileExt(pathTemplate, data) {
    const path = pathTemplate.replace('{date}', getDate());
    await writeFile(path, data);
    console.log(`Written to ${path}`);
}


main();