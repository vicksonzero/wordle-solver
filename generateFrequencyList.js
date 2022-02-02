//@ts-check

//#region head
require('dotenv').config();
if (process.env.SILENT) {
    process.env.VERBOSE = '';
    process.env.VERBOSE_SOLVER = '';
}

// lib
const { readFile, writeFile, appendFile } = require('fs/promises');

//#endregion

//#region body
let answers = [];
let allWords = []; // allowed guesses and answers mixed, sorted

async function main() {
    await setup();

    let alphabetsFreq = {};

    for (const word of allWords) {
        let alphabetsInWord = {};
        for (const letter of word.split('')) {
            alphabetsInWord[letter] = true;
        }

        for (const letter of Object.keys(alphabetsInWord)) {
            alphabetsFreq[letter] = (alphabetsFreq[letter] || 0) + 1;
        }
    }
    const alphabetsFreqList = Object.entries(alphabetsFreq);
    alphabetsFreqList.sort(([k1, v1], [k2, v2]) => v1 - v2).reverse();

    const result = 'exports.frequencyList=' + JSON.stringify(alphabetsFreqList.map(([k, v]) => k));
    writeFileExt(process.env.LETTER_FREQ_FILE, result);
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

//#region utils

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
