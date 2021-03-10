# BodyLanguage-Vue

This is something I whipped up in about a week to a week and a half back in 2018. It was the first (and so far only) time I worked in Vue, and it was an interesting experience. This also does a lot of neat stuff that tends to hold together all right, although it has not been deeply tested, and was only used one time for Anthro East Coast in 2018.

## Operation

The application is meant to be run on three screens. The control screen should be seen only by the board tender; the word display screen should be visible only to the actor; and the game display screen should be visible to everybody. Controls should be more or less straightforward for anyone who understands the rules of the [Body Language](https://en.wikipedia.org/wiki/Body_Language_(game_show)) game show.

The file `js/cpanel.js` can be updated to add more puzzles to the game database. Words in square brackets will be presented to the actor to act out; words in curly braces are only available in the question phase. Loose words are used in the bonus round as well as the "Hot Potato" round, and trap words are used only in the Hot Potato round, explained below.

The application will keep track of all words and puzzles used in a session, but this data is not saved e.g. in a cookie.

## Hot Potato

The Hot Potato round is a new set of rules added for this application, which is an alternate form of tie breaker. Both actors will take the stage. One at a time, they will act out the word on the screen, and continue to do so until their partner gets one right. When time runs out, the team whose actor is active loses the round. If all ten words are guessed, the team who spent the least amount of time on their words wins. One selection from the "Trap words" database will be added to the bank of words to guess, for additional challenge.

## Missing files

Certain files were withheld due to copyright concerns:
- fonts [Microsoft]
  - SEGOEUI.TTF
  - SEGOEUIB.TTF
  - SEGOEUII.TTF
  - SEGOEUIL.TTF
  - SEGOEUIZ.TTF
  - SEGUIBL.TTF
  - SEGUIBLI.TTF
  - SEGUILI.TTF
- img [Fremantle Media]
  - Body_Language_logo.png
- sound [Fremantle Media]
  - Beep.wav
  - BigWin2.wav
  - Buzz.wav
  - ContestantCue.wav
  - Correct.mp3
  - Ding.wav
  - FirstWin2.wav
  - FullTheme2.ogg
