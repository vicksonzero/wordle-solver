//@ts-check
exports.name = 'naive solver';
// performance (2022_02_02T10_34_35):
// {
//     "minGuesses": 2,
//     "maxGuesses": 102,
//     "fails": 0,
//     "totalGuesses": 38582
// }

/**
 * 
 * @param {string} answer - 5-letter answer
 * @param {string[]} wordList - a list of all available words to guess. `answer` is within that
 * @param {(answer:string, guess:string)=>string} solveLine - function that takes the answer and the guess, and outputs a string of (0|1|2)
 * @param {number} trials - max allowed trials before giving up
 * @returns {string} comma-separated list of guesses, with the answer at the end of the list
 */
exports.solver = function (answer, wordList, solveLine, trials=6) {
    let result = [];
    // setup

    let choices = wordList;

    for (let trial = 0; trial < trials; trial++) {
        const guess = choices[0];
        result.push(guess);
        if (process.env.VERBOSE_SOLVER) console.log(`trial: ${trial}`);
        if (process.env.VERBOSE_SOLVER) console.log(choices);
        /**
         * @type {Array<'0'|'1'|'2'>}
         */
        // @ts-ignore
        const feedback = solveLine(answer, guess).split('');

        if (feedback.join('') === '22222') break;

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
                if (feedback[j] === '2' && choice[j] !== guess[j]) {
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
    }
    // if(process.env.VERBOSE_SOLVER) console.log(`Solver ended in () trials: ${result}`)
    return result.join(',');
}
