//@ts-check

exports.solver = function (answer, wordList, solveLine, trials) {
    let result = [];
    // setup

    for (let i = 0; i < trials; i++) {
        const guess = 'aeiou';
        result.push(guess);
        const feedback = solveLine(answer, guess);

        // do something about feedback

    }
    result.push(answer);
    return result.join(',');
}
