<template>
<div id="app">
<h1>
zxcv
</h1>
<div class="window">
<div class="frame_window">
<transition-group class="frames" name="notes" tag="div">
<div class="frame notes-item" v-bind:key="note.id" v-for="note in recentNotes">
<div class="z note" v-bind:class="{active: note.note &amp; constants.notes.z }"></div>
<div class="x note" v-bind:class="{active: note.note &amp; constants.notes.x }"></div>
<div class="c note" v-bind:class="{active: note.note &amp; constants.notes.c }"></div>
<div class="v note" v-bind:class="{active: note.note &amp; constants.notes.v }"></div>
</div>
</transition-group>
</div>
<div class="ui">
<div class="score" v-if="gameState != this.constants.gameStates.title">
{{score}}
</div>
<div class="life" v-bind:class="{ normal: !isDanger, danger: isDanger }" v-bind:style="{width: lifeLength}" v-if="gameState != this.constants.gameStates.title"></div>
<div class="dead" v-if="gameState == this.constants.gameStates.gameOver">
GAME OVER (r to reset)
</div>
<div class="title" v-if="gameState == this.constants.gameStates.title">
Z X C V
kick zxcv to start
</div>
<div class="win" v-if="gameState == this.constants.gameStates.cleared">
WIN (r to reset)
</div>
</div>
</div>
</div>
</template>

<script>
export default {
  data: function(){
    return {
      notes: [],
      keyboard: [],
      score: 0,
      life: 0,
      gameState: 0,
      sounds: {},
    };
  },
  created: function(){
    this.reset();
    this.invokeUpdate();
    this.loadSounds();
    this.mountKeyboardEvent();
  },
  computed: {
    recentNotes: function(){
      return this.notes.slice(0, this.constants.displayNotes).reverse();
    },
    lifeLength: function(){
      return (this.life / this.constants.maxLife * 100) + "%"
    },
    alive: function() {
      return this.life > 0;
    },
    isDanger: function(){
      return this.life < this.constants.dangerLine;
    },
    constants: function(){
      return {
        notes: {
          "z": 0b0001,
          "x": 0b0010,
          "c": 0b0100,
          "v": 0b1000,
        },
        currentTime: 0,
        timeDelta: 0,
        maxLife: 10000,
        dangerLine: 3333,
        minDamagePerLife: 10,
        recoverPerNote: 250,
        badDamage: 100,
        displayNotes: 16,
        initialNotes: 1000,
        gameStates: {
          title: 0,
          inGame: 1,
          gameOver: 2,
          cleared: 3,
        },
      }
    },
  },
  methods: {
    // initializers
    initNotes: function () {
      this.notes = [];
      for (let i = 0; i < 100; ++i){
        let notes = [0b0001, 0b0010, 0b0100, 0b1000];
        for(let i = notes.length - 1; i > 0; i--){
          let r = Math.floor(Math.random() * (i + 1));
          let tmp = notes[i];
          notes[i] = notes[r];
          notes[r] = tmp;
        }
        for(let note of notes){
          this.notes.push(
            {
              id: this.notes.length,
              note: note,
            }
          );
        }
      }
    },
    initKeyboard: function () {
      for(let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
        this.keyboard[String.fromCharCode(i)] = 0;
      }
    },

    reset: function(){
      this.gameState = this.constants.gameStates.title;
      this.initNotes();
      this.initKeyboard();
      this.score = 0;
      this.life = this.constants.maxLife;
      this.currentTime = 0;
      this.timeDelta = 0;
    },

    loadSounds: function(){
      //this.sounds.z = new Audio("/game/zxcv/sounds/z.wav");
      //this.sounds.x = new Audio("/game/zxcv/sounds/x.wav");
      //this.sounds.c = new Audio("/game/zxcv/sounds/c.wav");
      //this.sounds.v = new Audio("/game/zxcv/sounds/v.wav");
    },

    mountKeyboardEvent: function(){
      document.onkeydown = function (e) {
        console.log(e);
        this.handleKeydown(e);
      }.bind(this);
      document.onkeyup = function (e) {
        this.handleKeyup(e);
      }.bind(this);
    },

    // handlers
    handleKeydown: function (e) {
      // keyboard は 押されたら1 押しっぱなしだとそれ以上 の値が入っている
      for (let key of this.keyboard.keys()) {
        if(this.keyboard[key]){
          this.keyboard[key] += 1;
        }
      }
      this.keyboard[e.key] = 1;
      this.triggerKeyboardEvents();
    },
    handleKeyup: function (e) {
      this.keyboard[e.key] = 0;
    },

    invokeUpdate: function(){
      this.updateTime();
      switch (this.gameState) {
        case this.constants.gameStates.title:
          break;
        case this.constants.gameStates.inGame:
          this.updateInGame();
          break;
        case this.constants.gameStates.gameOver:
          break;
        case this.constants.gameStates.cleared:
          break;
        default:
          console.error(`undefined game mode set: ${this.gameState} on update`);
          break;
      }
      requestAnimationFrame(this.invokeUpdate);
    },

    updateTime: function(){
      const prevTime = this.currentTime;
      const now = new Date().getTime();
      this.timeDelta = now - prevTime;
      this.currentTime = now;
    },

    updateInGame: function(){
      // TODO: ライフの減算量をフレームレート非依存にする
      let damage = Math.max(this.score/ 2, this.constants.minDamagePerLife);
      damage *= this.timeDelta / 17; // 1F=17msに合わせて補正する
      if(this.isDanger){
        damage /= 2;
      }
      console.log(damage);
      this.life -= parseInt(damage);
    },

    triggerKeyboardEvents: function(){
      switch (this.gameState) {
        case this.constants.gameStates.title:
          this.handleKeyTitle();
          break;
        case this.constants.gameStates.inGame:
          this.handleKeyInGame();
          break;
        case this.constants.gameStates.gameOver:
          this.handleKeyGameOver();
          break;
        case this.constants.gameStates.cleared:
          this.handleKeyCleared();
          break;
        default:
          console.error(`undefined game mode set: ${this.gameState} on trigger Key Event`);
          break;
      }
    },

    keyboardStatus: function(){
      let result = 0;
      for (let [key, value] of Object.entries(this.constants.notes)) {
        if(this.keyboard[key]){
          result += value;
        }
      }
      return result;
    },

    // zxcvと1248の相互変換がめんどいでござる
    lastKey: function(){
      for (let [key, _] of Object.entries(this.constants.notes)) {
        if(this.keyboard[key] === 1){
          return key;
        }
      }
      return "";
    },

    handleKeyTitle: function(){
      if(this.keyboardStatus()){
        this.gameState = this.constants.gameStates.inGame;
      }
    },

    handleKeyInGame: function(){
      // 死んでたらキーの処理をしない
      if(!this.alive){
        this.gameState = this.constants.gameStates.gameOver;
        return;
      }

      const keyStatus = this.keyboardStatus();
      const lastKey = this.lastKey();

      // 「今」押されたキーが次のノーツと一切関係がなかったらBAD
      if((keyStatus & this.notes[0].note) === 0) {
        // ここで対応するbadの演出出せると良いなあ
        this.score -= 1;
        this.life -= this.constants.badDamage;
      }

      if((keyStatus & this.notes[0].note) === this.notes[0].note){
        // 現状の構造だとキーが押されているかどうかしか判定されないので
        //this.sounds[lastKey].currentTime = 0;
        //this.sounds[lastKey].play();
        this.notes.shift();
        this.score++;
        this.life += this.constants.recoverPerNote;
      }

      // クリア判定
      if(this.notes.length === 0){
        this.gameState = this.constants.gameStates.cleared;
      }
    },

    handleKeyGameOver: function(){
      if(this.keyboard["r"]){
        this.reset();
      }
    },

    handleKeyCleared: function(){
      if(this.keyboard["r"]){
        this.reset();
      }
    },
  }
}
</script>

<style lang='scss' scoped>
$note_width: 180px;
$note_height: 30px;
$note_count: 16;

.window{
  display: block;
  position: relative;
  width: $note_width * 4 + 50;
  height: $note_height * $note_count + 50;
  padding: 0px 25px 50px 25px;
  margin: auto;
}

.ui{
  z-index: 100;
}

.score{
  position: absolute;
  left: 20%;
  bottom: 30%;
  width: 60%;
  text-align: center;
  opacity: 0.8;
  font-size: 40px;
}

.life{
  height: 20px;
  transform: translateY(-100px);
  opacity: 0.4;
}

.normal{
  background-color: #0b5daa;
}

.danger{
  background-color: #aa3a0d;
}

.dead{
  position: absolute;
  left: 20%;
  bottom: 40%;
  width: 60%;
  opacity: 0.8;
  font-size: 40px;
  text-align: center;
  color: #B00100;
}

.title{
  white-space: pre;
  position: absolute;
  left: 10%;
  bottom: 40%;
  width: 80%;
  opacity: 0.8;
  font-size: 60px;
  text-align: center;
  color: #5169b0;
}

.win{
  position: absolute;
  left: 20%;
  bottom: 40%;
  width: 60%;
  opacity: 0.8;
  font-size: 40px;
  text-align: center;
  color: #5366e1;
}

.frame_window{
  z-index: 10;
  transform: scaleY(1.6) perspective(40px) rotateX(5deg);
  transform-origin: bottom center;
  width: $note_width * 4;
  height: $note_height * $note_count;
}

.notes-item{
  transition: all 0.3s;
}
.notes-enter, .notes-leave-to{
  opacity: 0;
  transform: scale(0.2);
}

.frames{
  display: flex;
  flex-direction: column;
  width: $note_width * 4;
  height: $note_height * $note_count;
}
.frame{
  display: flex;
  flex-direction: row;
  width: $note_width * 4;
  height: $note_height;
  .note{
    width: $note_width;
    height: $note_height;
  }
  .active{
    background-color: #0f0f0f;
  }
}

</style>
