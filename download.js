
const fs = require('fs');
const { readFile } = require('fs/promises');


// download resources
if (!fs.existsSync(WORDLE_ANSWERS_PATH)) {
    const file = fs.createWriteStream("file.jpg");
    const request = https.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function (response) {
        response.pipe(file);
    });
}
if (!fs.existsSync(WORDLE_ALLOWED_GUESSES_PATH)) {

}