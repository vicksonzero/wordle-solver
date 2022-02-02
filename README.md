# wordle-solver
Casual wordle solver. Not gonna be fast, i just want to make one, so that i can say i did one. 


Going to submit to https://freshman.dev/wordle/#/leaderboard if it solves all questions without "X"


Project start: **2022-02-02 14:30 (UTC+8)**  
Naive solution done: **2022-02-02 18:30 (UTC+8)**


# Set up

```
git clone
npm install
node download.js
```

# To run app

Check `.env` file for different runner modes

```
node index.js
```

# How to read `index.js`

4 Sections:

### head
Includes and external Util setups

### body
Main function, and loading of data files

### runner
runs test cases, calls solver

### utils
misc helper functions



# Resources


Instructions here: https://www.reddit.com/r/wordle/comments/s88iq4/a_wordle_bot_leaderboard/
https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b#file-wordle-answers-alphabetical-txt
https://gist.github.com/cfreshman/cdcdf777450c5b5301e439061d29694c#file-wordle-allowed-guesses-txt