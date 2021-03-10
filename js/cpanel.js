const soundboard = {
  ding: new Audio('sound/Ding.wav'),
  buzz: new Audio('sound/Buzz.wav'),
  beep: new Audio('sound/Beep.wav'),
  correct: new Audio('sound/Correct.mp3'),
  contestant: new Audio('sound/ContestantCue.wav'),
  firstwin: new Audio('sound/FirstWin2.wav'),
  finalwin: new Audio('sound/BigWin2.wav'),
  theme: new Audio('sound/FullTheme2.ogg')
};
soundboard.beep.volume = .2;

var app = new Vue({
  el: '#app',

  data: {
    defaultTeamNames: ['Team #1', 'Team #2', 'Team #3', 'Team #4'],
    teamNames: ['', '', '', ''],
    activeTeams: [0, 1],

    score: [0, 0],
    hotPotatoTimes: [null, null],
    hpSF: [0, 0],
    hpStartTeam: 0,
    hotPotatoTeam: null,
    newScore: [null, null],
    goalScores: {
      first: 200,
      final: 500
    },
    goalScore: null,
    roundScores: {
      first: [100, 100, 100],
      final: [100, 200, 200, 300, 300]
    },
    logoShown: false,
    finalGame: 'first',

    roundNumber: -1,
    roundType: 'full',
    roundScore: null,
    holdoverScore: 0,
    newHoldoverScore: null,

    puzzles: [
      //'This [president] of a {wrestling} group which features [Superstars] and [Divas] once [launched] a failed [football] {league}. =VINCE McMAHON',
      'This [video game] {series}, mostly consisting of [open] [world] [adventures], is named after {papers} read by the [blind]. =THE ELDER SCROLLS',
      '[Tiger] {Woods} [drives] to this, and when you [see] this {colour} [light], it\'s time to [go]. =GREEN',
      '[Madonna], [Mustang], [Money], [Mushroom], and [Mustard] all {start} with this {letter}. =M',
      'A [big] {yellow} one was a [hit] for [The Counting Crows], and also a [television] [show] which launched {Danny DeVito}. =TAXI',
      'A {leader} chosen by a [watery] [tart] with a [sword], a [crowned] {checker}, or a prolific [writer]. =KING',
      'What happens to a [computer] that\'s [malfunctioning], a [new] {version} of a [classic] [story], and a {series} that\'s had one recently. =REBOOT',
      'The {name} of a [cartoon] [family], and of an {infamous} [football] [player] accused of [murder]. =SIMPSON',
      'This [content] [distribution] {service} might [blow] out of a [hot] {leaking} [pipe]. =STEAM',
      'This {professional} [gamer] is known for [competing] in {fighting} [tournaments] in [full] [costume]. =SONICFOX',
      'This [silent] [trio] in {matching} [uniforms] likes to mix [visual] {effects} with [audio]. =BLUE MAN GROUP',
      'An [unwanted] [revealed] {plotline}, or a [flap] on the [back] of a [car] to control {airflow}. =SPOILER',
      'This [singer] shows her [poker face] to her [little] {monsters} while wearing {meat} [dresses]. =LADY GAGA'
    ],
    looseWords: [
      'airplane', 'astronaut', 'pizza', 'feather', 'fetal position',
      'explosion', 'watch', 'remote control', 'USB', 'smartphone',
      'beach', 'finger painting', 'lipstick', 'keyboard', 'trap',
      'standing ovation', 'switch', 'vegetables', 'Sherlock Holmes', 'lawn',
      'elevator', 'echo', 'photo', 'doctor', 'Duck Duck Goose',
      'snowball', 'brain', 'airport security', 'scoot', 'arm wrestling',
      'Make It Rain', 'bonfire', 'Trick or Treat', 'volcano', 'joke',
      'Macarena', 'wheelbarrow', 'party', 'hungry', 'handcuffs',
      'earthquake', 'twist', 'cape', 'sneaking', 'scarf'
    ],
    trapWords: [
      'Badger Badger Mushroom', 'Everybody Do The Flop', 'Pump Up the Jam',
      'Space Jam', 'Harry Potter and the Philosopher\'s Stone'
    ],
    curPuzzle: null,
    wordsInPlay: [],
    curWord: -1,
    actingClock: null,
    actingSeconds: 0,
    answerClock: null,
    answerSeconds: null,

    BLD: { W: null, G: null }
  },

  computed: {
    cTeamNames() {
      return this.teamNames.slice().map((i, x) => i || this.defaultTeamNames[x]);
    },
    curRoundScore() {
      if (!isNaN(parseInt(this.roundScore))) return parseInt(this.roundScore);
      else return this.roundScores[this.finalGame][this.roundNumber] || 0;
    },
    curGoalScore() {
      if (!isNaN(parseInt(this.goalScore))) return parseInt(this.goalScore);
      else return this.goalScores[this.finalGame] || 200;
    },
    curPuzzlePhrase() {
      if (this.curPuzzle === null) return null;
      else {
        var eq = this.curPuzzle.indexOf('=');
        return eq < 0 ? this.curPuzzle : this.curPuzzle.substring(0, eq - 1).trim();
      }
    },
    curPuzzleAnswer() {
      if (this.curPuzzle === null) return null;
      else {
        var eq = this.curPuzzle.indexOf('=');
        return eq < 0 ? '???' : this.curPuzzle.substring(eq + 1);
      }
    },
    hotPotatoCurTeam() {
      if (this.hotPotatoTeam === null || this.hotPotatoTeam < 0 || this.hotPotatoTeam > 1) return '---';
      else return this.teamNames[this.activeTeams[this.hotPotatoTeam]]
        || this.defaultTeamNames[this.activeTeams[this.hotPotatoTeam]];
    }
  },

  methods: {
    setupOpenWordDisplay() {
      this.BLD.W = BLP.openNewTab({
        url: 'worddisplay.html',
        windowName: 'BLWordDisplay'
      }).id;
    },

    setupOpenGameDisplay() {
      this.BLD.G = BLP.openNewTab({
        url: 'gamedisplay.html',
        windowName: 'BLGameDisplay'
      }).id;
    },

    setupLogo() {
      if (this.BLD.G) {
        BLP.broadCastTo(this.BLD.G, { type: 'logo' });
        this.logoShown = true;
      }
    },

    setupChangeTeams() {
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, {
        type: 'teamname',
        leftteam: this.cTeamNames[this.activeTeams[0]], rightteam: this.cTeamNames[this.activeTeams[1]]
      });
    },

    setupStartNewGame() {
      this.score[0] = this.score[1] = this.roundNumber = this.holdoverScore = 0;
      this.newScore[0] = this.newScore[1] = this.roundScore = null;
      $('[id="t-Round Setup"]').trigger('click');
      soundboard.contestant.play();
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'scoreboard', toggle: true });
    },

    roundOverrideScores() {
      if (this.newScore[0] === null && this.newScore[1] === null) return;
      if (this.newScore[0] !== null) this.score[0] = parseInt(this.newScore[0]);
      if (this.newScore[1] !== null) this.score[1] = parseInt(this.newScore[1]);
      this.newScore[0] = this.newScore[1] = null;
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, {
        type: 'score', override: true,
        leftteam: this.score[0], rightteam: this.score[1]
      });
    },

    roundOverrideHoldover() {
      if (this.newHoldoverScore === null) return;
      this.holdoverScore = this.newHoldoverScore;
      this.newHoldoverScore = null;
    },

    roundStart() {
      this.curWord = -1; this.hotPotatoTeam = null;
      switch (this.roundType) {
        case 'full':
          this.curPuzzle = this.puzzles.splice(Math.random() * this.puzzles.length, 1)[0];
          this.wordsInPlay = (() => {
            var preshuffle = this.curPuzzle.match(/[\[{].*?(?=[\]}])/g).map((i, x) => {
              return { word: i.substring(1), position: x, acted: i[0] == '[' }
            }).filter(i => i.acted);
            var retval = [];
            while (preshuffle.length > 0) retval.push(preshuffle.splice(Math.random() * preshuffle.length, 1)[0]);
            return retval;
          })();
          this.miscSetClock(60);
          if (this.BLD.W) BLP.broadCastTo(this.BLD.W, { type: 'word', data: '-READY-' });
          $('[id="t-Acting Round"]').trigger('click');
          break;

        case 'quick':
          this.curPuzzle = this.puzzles.splice(Math.random() * this.puzzles.length, 1)[0];
          $('button.prs').css('background-color', '').prop('disabled', false);
          if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'showpuzzle', puzzle: this.curPuzzle, puzzleonly: true });
          $('[id="t-Puzzle Round"]').trigger('click');
          break;

        case 'hot':
          this.hotPotatoTeam = -1;
          this.wordsInPlay = (() => {
            var retval = [];
            var trapWord = Math.round(Math.random() * 6) + 2;
            for (var x = 0; x < 10; x++)
              retval.push({
                word: this[x == trapWord ? 'trapWords' : 'looseWords'].splice(
                  Math.random() * this[x == trapWord ? 'trapWords' : 'looseWords'].length, 1)[0]
              });
            return retval;
          })();
          this.miscSetClock(60);
          this.hotPotatoTimes[0] = new Timer(); this.hotPotatoTimes[1] = new Timer();
          this.hotPotatoTimes.forEach((i, x) => $(i).on('secondTenthsUpdated', ({ currentTarget }) => {
            this.hpSF[x] = currentTarget.getTotalTimeValues().secondTenths / 10;
          }));
          if (this.BLD.W) BLP.broadCastTo(this.BLD.W, { type: 'word', data: '-READY-' });
          $('[id="t-Acting Round"]').trigger('click');
          break;
      }
      if (this.BLD.W && this.roundType != 'quick')
        BLP.broadCastTo(this.BLD.W, { type: 'markers', data: this.wordsInPlay.length });
    },

    actingManualState({ target }) {
      if (this.actingSeconds >= 0) {
        var isCurWord = this.curWord == target.dataset.index;
        var isGuessed = this.wordsInPlay[target.dataset.index].guessed;
        if (isCurWord && isGuessed) this.actingGet();
        else if (this.BLD.W) BLP.broadCastTo(this.BLD.W, {
          type: 'marker', index: target.dataset.index,
          state: isGuessed ? 'correct' : (isCurWord ? 'active' : 'inactive')
        });
        if (isGuessed) this.miscDing();
      }
    },

    actingPass() {
      var nextCurWord = this.curWord;
      if (this.roundType == 'hot' && this.hotPotatoTeam < 0) this.hotPotatoTeam = this.hpStartTeam;
      do {
        if (++nextCurWord == this.wordsInPlay.length) nextCurWord = 0;
        if (!this.wordsInPlay[nextCurWord].guessed) break;
      } while (nextCurWord !== this.curWord);
      if (this.curWord !== nextCurWord) {
        if (this.BLD.W) {

          if (this.curWord >= 0) BLP.broadCastTo(this.BLD.W, {
            type: 'marker', index: this.curWord, state: (() => {
              if (!this.wordsInPlay[this.curWord].guessed) return 'inactive';
              // The below line is reversed in colours because the HP team has already changed by this point
              else if (this.roundType == 'hot') return this.hotPotatoTeam === 0 ? 'correct-red' : 'correct-blue';
              else return 'correct';
            })()
          });
          BLP.broadCastTo(this.BLD.W, { type: 'marker', index: nextCurWord, state: 'active' });
          if (this.actingSeconds > 0) BLP.broadCastTo(this.BLD.W, {
            type: 'word', data: this.wordsInPlay[nextCurWord].word,
            hot: this.roundType == 'hot' ? this.hotPotatoTeam : null
          });
        }
        this.curWord = nextCurWord;
        this.wordsInPlay[this.curWord].shown = true;
        return true;
      } else {
        if (this.wordsInPlay[this.curWord].guessed && this.BLD.W)
          BLP.broadCastTo(this.BLD.W, { type: 'marker', index: this.curWord, state: 'correct' });
        return this.wordsInPlay[this.curWord].guessed !== true;
      }
    },

    actingStartPause() {
      if (this.roundType == 'hot')
        this.hotPotatoTimes[this.hotPotatoTeam][this.actingClock.isRunning() ? 'pause' : 'start']({ precision: 'secondTenths' });
      this.actingClock[this.actingClock.isRunning() ? 'pause' : 'start']();
    },

    actingGet() {
      this.wordsInPlay[this.curWord].guessed = true;
      if (this.roundType == 'hot') {
        this.hotPotatoTimes[this.hotPotatoTeam].pause();
        this.hotPotatoTeam = (this.hotPotatoTeam == 0) ? 1 : 0;
      }
      var isMoreWords = this.actingPass();
      this.miscDing(isMoreWords ? 1 : 10);
      if (isMoreWords) {
        if (this.roundType == 'hot') this.hotPotatoTimes[this.hotPotatoTeam].start({ precision: 'secondTenths' });
      } else {
        if (this.roundType == 'hot' && this.BLD.G) {
          BLP.broadCastTo(this.BLD.G, { type: 'timer', toggle: false });
          BLP.broadCastTo(this.BLD.G, { type: 'scoreboard', toggle: true });
        }
        if (this.BLD.W) BLP.broadCastTo(this.BLD.W, { type: 'word', data: '-CLEAR-' });
        this.actingSeconds = 0;
        this.actingClock.pause();
      }
    },

    actingBadClue() {
      this.actingClock.pause();
      soundboard.buzz.play();
      if (this.BLD.W) BLP.broadCastTo(this.BLD.W, { type: 'marker', index: this.curWord, state: 'bad' });
      this.actingSeconds = -1;
      if (this.roundType == 'hot') {
        if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'timer', toggle: false });
        setTimeout(() => this.miscNameWinner(false), 1000);
      }
    },

    actingSendWordsToGameDisplay() {
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, {
        type: 'showwords', words: this.wordsInPlay.reduce((r, i) => {
          if (i.guessed) r.push(i.word); return r;
        }, [])
      });
    },

    actingSendPuzzleToGameDisplay() {
      var guessed = Array(7).fill(false);
      $('button.prs').css('background-color', '').prop('disabled', false);
      this.wordsInPlay.forEach(i => {
        if (i.guessed) {
          $('button#pr' + i.position).css('background-color', '#ee8c31');
          guessed[i.position] = true;
        }
      });
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'showpuzzle', puzzle: this.curPuzzle, guessed: guessed });
      $('[id="t-Puzzle Round"]').trigger('click');
    },

    actingSendHPResultToGameDisplay() {
      var oldScore = this.score.slice();
      if (!this.roundType == 'hot') return;
      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'score', leftteam: this.hpSF[0], rightteam: this.hpSF[1] });
      if (this.hpSF[0] != this.hpSF[1]) setTimeout(() => {
        this.miscNameWinner(this.hpSF[0] > this.hpSF[1] ? 1 : 0);
      }, 1500);
      else {
        setTimeout(this.miscDing, 500);
        this.holdoverScore += this.curRoundScore;
        this.roundScore = null;
      }
      if (this.BLD.G) setTimeout(() => {
        BLP.broadCastTo(this.BLD.G, { type: 'score', leftteam: oldScore[0], rightteam: oldScore[1] });
      }, 4000);
    },

    puzzleReveal({ target }) {
      if (this.BLD.G === null) return;
      BLP.broadCastTo(this.BLD.G, { type: 'reveal', word: parseInt(target.dataset.index) });
      $(`button#pr${target.dataset.index - 1}`).css('background-color', 'default').prop('disabled', true);
      this.miscDing();
    },

    puzzleAnswerClock() {
      if (this.answerClock) {
        this.answerClock.stop();
        this.answerClock = this.answerSeconds = null;
      } else {
        this.answerClock = new Timer();
        this.answerSeconds = 3;
        this.answerClock.start({ startValues: { seconds: 3 }, countdown: true });
        $(this.answerClock).on('secondsUpdated', ({ currentTarget }) => {
          this.answerSeconds = currentTarget.getTotalTimeValues().seconds;
        }).on('targetAchieved', () => {
          soundboard.buzz.play();
          this.answerClock = this.answerSeconds = null;
        });
      }
    },

    puzzleResolve({ target }) {
      if (this.BLD.G === null) return;
      if (target.dataset.index !== undefined) {
        var index = parseInt(target.dataset.index);
        this.miscDing(20);
        this.score[index] += this.curRoundScore + this.holdoverScore;
        this.holdoverScore = 0; this.roundScore = null;
        if (this.score[index] >= this.curGoalScore)
          soundboard[this.finalGame + 'win'].play();
      } else this.holdoverScore += this.curRoundScore;
      this.roundNumber++;
      this.roundScore = null;
      BLP.broadCastTo(this.BLD.G, {
        type: 'answer', solved: index !== undefined,
        leftteam: this.score[0], rightteam: this.score[1]
      });
    },

    puzzleNextRound(nextGame) {
      if (this.BLD.G !== null) {
        BLP.broadCastTo(this.BLD.G, { type: 'clearpuzzle' });
        if (!nextGame) BLP.broadCastTo(this.BLD.G, { type: 'scoreboard', toggle: true });
      }
      $(nextGame ? '[id="t-Game Setup"]' : '[id="t-Round Setup"]').trigger('click');
    },

    miscTheme(on) {
      if (on) soundboard.theme.play();
      else {
        function fadeTheme() {
          if (soundboard.theme.volume > 0) {
            soundboard.theme.volume = Math.max(0, soundboard.theme.volume - 0.01);
            setTimeout(fadeTheme, 20);
          } else {
            soundboard.theme.pause();
            soundboard.theme.currentTime = 0;
            soundboard.theme.volume = 1;
          }
        }
        fadeTheme();
      }
    },

    miscSetClock(time) {
      this.actingClock = new Timer();
      this.actingSeconds = time;
      this.actingClock.start({ startValues: { seconds: time }, countdown: true });
      this.actingClock.pause();
      $(this.actingClock).on('secondsUpdated', () => {
        var sec = this.actingClock.getTotalTimeValues().seconds;
        this.actingSeconds = sec;
        BLP.broadCastAll({ type: 'clock', clock: sec })
        if (sec > 0) soundboard.beep.play();
      }).on('targetAchieved', () => {
        soundboard.buzz.play();
        if (this.BLD.W) BLP.broadCastTo(this.BLD.W, { type: 'word', data: (this.roundType == 'hot') ? '-OUT-' : '-TIME-' });
        if (this.roundType == 'hot') {
          if (this.BLD.G) BLP.broadCastTo(this.BLD.G, { type: 'timer', toggle: false });
          setTimeout(() => this.miscNameWinner(false), 1000);
        }
      });
      BLP.broadCastAll({ type: 'clock', set: true, clock: time });
      this.miscDing();
    },

    miscDing(qty, delay) {
      function ding() {
        if (soundboard.ding.paused) {
          soundboard.ding.play();
        } else soundboard.ding.currentTime = 0;
      }

      if (qty === undefined || qty == 1) ding();
      else {
        var dingx = 0;
        if (typeof delay != 'number') delay = 120;
        function dingloop() {
          ding();
          if (++dingx < qty) setTimeout(dingloop, delay);
        }
        dingloop();
      }
    },

    miscPlay(samplename) {
      if (!soundboard[samplename]) return;
      soundboard[samplename].play();
    },

    miscNameWinner(team) {
      if (team === false) team = (this.hotPotatoTeam == 0) ? 1 : 0;
      else if (team === true) team = this.hotPotatoTeam;
      this.miscDing(20);
      this.score[team] += this.curRoundScore + this.holdoverScore;
      this.holdoverScore = 0; this.roundScore = null;
      if (this.score[team] >= this.curGoalScore) soundboard[this.finalGame + 'win'].play();
      else this.roundNumber++;
      this.roundScore = null;

      if (this.BLD.G) BLP.broadCastTo(this.BLD.G, {
        type: 'hpwinner',
        winName: this.cTeamNames[this.activeTeams[team]],
        solved: true, leftteam: this.score[0], rightteam: this.score[1]
      });
    },

    atChildMsg(data) {
      if (data.id == this.BLD.W) {

      } else if (data.id == this.BLD.G) {

      }
    },

    atDisconnect(data) {
      if (data.id == this.BLD.W) {
        this.BLD.W = null;
      } else if (data.id == this.BLD.G) {
        this.BLD.G = null;
      }
    }
  }
});

const BLP = new AcrossTabs.default.Parent({
  onHandshakeCallback: function (data) {
    //console.log(data);
    //if (data.id == BLWD) $('#wdcontrol').prop('disabled', false);
    //else if (data.id == BLGD) $('#gdcontrol').prop('disabled', false);
  },
  onPollingCallback: function (data) { },
  onChildCommunication: app.atChildMsg,
  onChildDisconnect: app.atDisconnect
});
