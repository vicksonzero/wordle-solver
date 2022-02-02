//@ts-check
const { frequencyList } = require('../data/frequency');

exports.name = 'naive solver with weighted choice';
// Summary:
// Solver: naive solver with weighted choice
// Date: 2022_02_02T15_51_21
// Total Guesses: 15110
// Avg Guesses: 6.5270
// Shortest Guesses: 2
// Longest Guesses: 23
// Fails: 0
// Guess Histogram:
//   2: 11
//   3: 64
//   4: 239
//   5: 420
//   6: 506
//   7: 439
//   8: 299
//   9: 164
//   10: 94
//   11: 47
//   12: 21
//   13: 9
//   14: 1
//   23: 1

/**
 * @param {string} answer - 5-letter answer
 * @param {string[]} wordList - a list of all available words to guess. `answer` is within that
 * @param {(answer:string, guess:string)=>string} solveLine - function that takes the answer and the guess, and outputs a string of (0|1|2)
 * @param {number} trials - max allowed trials before giving up
 * @returns {string} comma-separated list of guesses, with the answer at the end of the list
 */
exports.solver = function (answer, wordList, solveLine, trials = 6) {
    let result = [];
    // setup

    let choices = wordList;
    let greenFeedback = ['_', '_', '_', '_', '_'];

    for (let trial = 0; trial < trials; trial++) {
        const guess = getChoice(choices, trial);
        result.push(guess);
        if (process.env.VERBOSE_SOLVER) console.log(`trial: ${trial}`);
        if (process.env.VERBOSE_SOLVER) console.log(choices);
        /**
         * @type {Array<'0'|'1'|'2'>}
         */
        // @ts-ignore
        const feedback = solveLine(answer, guess).split('');

        if (feedback.join('') === '22222') break;

        const greenChar = [];
        for (let j = 0; j < 5; j++) { // for all guess letters in yellow
            if (feedback[j] === '2') {
                greenChar.push(guess[j]);
                greenFeedback[j] = '2';
            }
        }
        // do something about feedback: green 2
        for (let i = 0; i < choices.length;) {
            const choice = choices[i];
            if (choice === guess) {
                if (process.env.VERBOSE_SOLVER) console.log(`Throw0: ${choice}`)
                choices.splice(i, 1);
                continue;
            }


            // green 2
            let keep = true;
            for (let j = 0; j < 5; j++) { // for all guess letters in green
                if (greenFeedback[j] === '2' && choice[j] !== guess[j]) {
                    keep = false;
                    if (process.env.VERBOSE_SOLVER) console.log(`Throw1: ${choice} (${j})`)
                    choices.splice(i, 1);
                    break;
                }
            }
            if (keep) {
                i++;
            }
        }


        const yellowChar = [];
        for (let j = 0; j < 5; j++) { // for all guess letters in yellow
            if (feedback[j] === '1') {
                yellowChar.push(guess[j]);
            }
        }
        if (process.env.VERBOSE_SOLVER) console.log(`yellowChar: ${yellowChar.join(',')}`)
        // do something about feedback: yellow 1
        for (let i = 0; i < choices.length;) {
            const choice = choices[i];


            // yellow 1
            for (const char of yellowChar) {
                if (choice.indexOf(char) < 0) {
                    if (process.env.VERBOSE_SOLVER) console.log(`Throw2: ${choice} (no ${char})`)
                    choices.splice(i, 1);
                    break;
                }
            }
            i++;
        }


        const whiteChar = [];
        for (let j = 0; j < 5; j++) { // for all guess letters in yellow
            if (feedback[j] === '0') {
                whiteChar.push(guess[j]);
            }
        }
        if (process.env.VERBOSE_SOLVER) console.log(`whiteChar: ${whiteChar.join(',')}`)
        // do something about feedback: yellow 1
        loopWhite:
        for (let i = 0; i < choices.length;) {
            const choice = choices[i];

            // white 0
            for (const char of whiteChar) {
                const charIndex = choice.indexOf(char);
                if (charIndex >= 0) {
                    if (greenFeedback[charIndex] === '2') {
                        if (process.env.VERBOSE_SOLVER) console.log(`DontThrow3: ${choice} (greenFeedback has ${char} on [${charIndex}])`)
                    } else if (yellowChar.includes(char)) {
                        if (process.env.VERBOSE_SOLVER) console.log(`DontThrow3: ${choice} (yellowChar has ${char})`)
                    } else {
                        if (process.env.VERBOSE_SOLVER) console.log(`Throw3: ${choice} (has ${char})`)
                        choices.splice(i, 1);
                        continue loopWhite;
                    }
                }
            }
            i++;
        }
    }
    // if(process.env.VERBOSE_SOLVER) console.log(`Solver ended in () trials: ${result}`)
    return result.join(',');
}


function getChoice(choices, trial) {
    if (trial === 0) return 'salet';
    const scores = [];
    for (const choice of choices) {
        scores.push('choice'.split('').map(c => (frequencyList.indexOf(c))).reduce(sum, 0));
    }
    let minIndex = 0;
    let minScore = 0;
    for (let i = 0; i < scores.length; i++) {
        if (minScore > scores[i]) {
            minIndex = i;
            minScore = scores[i];
        }
    }
    return choices[minIndex];
}

function sum(a, b) {
    return a + b;
}