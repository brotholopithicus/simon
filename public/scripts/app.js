/* ========== CONSTANTS ========== */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ASPECT = WIDTH / HEIGHT;

/* ========== ASSETS ========== */
let noteOne = new Audio('../assets/a3.mp3');
let noteTwo = new Audio('../assets/f3.mp3');
let noteThree = new Audio('../assets/f4.mp3');
let noteFour = new Audio('../assets/f5.mp3');
let error = new Audio('../assets/error.wav');

/* ========== CANVAS SETUP ========== */
canvas.width = WIDTH;
canvas.height = HEIGHT;
const CENTER = {
    x: canvas.width / 2,
    y: canvas.height / 2
};
let RADIUS;

if (WIDTH > 1400 && HEIGHT > 700) {
    console.log('1400 700');
    RADIUS = 325;
} else if (WIDTH > 700 && HEIGHT > 500) {
    console.log('1200 500');
    RADIUS = 225;
} else if (WIDTH > 500 && HEIGHT > 400) {
    console.log('700 400');
    RADIUS = 175;
} else if (WIDTH > 400 && HEIGHT > 300) {
    console.log('400 300');
    RADIUS = 125;
} else {
    console.log('last');
    RADIUS = 50;
}

const bgColor = '#373737';

function clear() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}


/* ========== QUADRANTS ========== */
class Quadrant {
    constructor(sAngle, eAngle, color) {
        this.x = CENTER.x;
        this.y = CENTER.y;
        this.sAngle = sAngle;
        this.eAngle = eAngle;
        this.color = color;
    }
    draw(color) {
        ctx.fillStyle = color || this.color;
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, RADIUS, this.sAngle, this.eAngle, false);
        ctx.lineTo(CENTER.x, CENTER.y);
        ctx.fill();
        ctx.stroke();
    }
}

/* ========== BOARD ========== */
class Game {
    constructor(quadrants) {
        // display props
        this.center = CENTER;
        this.radius = RADIUS;

        // game props
        this.active = false;
        this.quadrants = quadrants;
        this.sequence = [];
        this.round = 0;
        this.strictMode = false;

        // timing variable
        this.pulse = 750;

        // player props
        this.playerSequence = [];
        this.turn = 0;
        this.score = 0;

        // text box
        this.textPosition = {
            x: WIDTH < 800 ? WIDTH - 110 : WIDTH - 250,
            y: 60
        };

    }
    drawStrictModeToggle() {
        // open shadow blur
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = this.strictMode ? '#b62626' : '#33ad24';
        ctx.fillRect(50, 50, 150, 50);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        let strictMode = this.strictMode ? 'ON' : 'OFF';
        ctx.fillText(`Strict Mode ${strictMode}`, 75, 80);
        ctx.shadowBlur = 0;
    }
    drawRestartButton() {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = '#2b2fa1';
        ctx.fillRect(50, 110, 150, 50);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Restart Game', 85, 140);
        // close shadow blur
        ctx.shadowBlur = 0;
    }
    initialize() {
        clear();
        this.drawStrictModeToggle();
        this.drawRestartButton();
        this.quadrants.forEach(quadrant => quadrant.draw());
        this.drawOutline();
        this.drawText();
    }
    drawText() {
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.drawHelp();
        this.drawScores();
        this.drawWhoseTurn();
        ctx.shadowBlur = 0;
    }
    drawScores() {
        ctx.font = '14px Helvetica Neue';
        ctx.fillStyle = '#ddd';
        ctx.fillText(`Score: ${this.score}`, this.textPosition.x, this.textPosition.y);
        ctx.fillText(`Round: ${this.round + 1}`, this.textPosition.x, this.textPosition.y + 15);
    }
    drawWhoseTurn() {
        ctx.font = '14px Helvetica Neue';
        let fillStyle = this.active ? '#4ac630' : '#ff0700';
        ctx.fillStyle = fillStyle;
        let whoseTurn = this.active ? 'Player Turn' : 'Computer Turn';
        ctx.fillText(whoseTurn, this.textPosition.x, this.textPosition.y + 90);
    }
    drawHelp() {
        ctx.font = '14px Helvetica Neue';
        ctx.fillStyle = '#ddd';
        ctx.fillText(`Target: ${this.round + 1}`, this.textPosition.x, this.textPosition.y + 45);
        ctx.fillText(`Current: ${this.turn}`, this.textPosition.x, this.textPosition.y + 60);
    }
    startGame() {
        this.clearData();
        this.newRound();
    }
    newRound() {
        alertify.log(`Round ${this.round + 1}`);
        this.sequence.push(this.randomNumber());
        this.animateSequence();
    }
    activateQuadrant(q) {
        clear();
        this.initialize();
        let color;
        switch (q) {
            case 0: // red
                noteOne.play();
                color = '#d92525';
                break;
            case 1: // green
                noteTwo.play();
                color = '#19d242';
                break;
            case 2: // yellow
                noteThree.play();
                color = '#eaee0e';
                break;
            case 3: // blue
                noteFour.play();
                color = '#134ee8';
                break;
            default:
                color = null;
                break;
        }
        let quadrant = this.quadrants[q];
        quadrant.draw(color);
        this.drawOutline();
        let self = this;
        setTimeout(() => {
            self.initialize();
        }, 500);
    }
    animateSequence() {
        let sequence = this.sequence;
        let self = this;
        for (var i = 0; i < sequence.length; i++) {
            setTimeout((id) => {
                self.activateQuadrant(id);
            }, (i + 1) * this.pulse, sequence[i]);
        }
        setTimeout(() => {
            self.addListeners();
            self.initialize();
        }, (sequence.length + 1) * self.pulse);
    }
    registerClick(pos) {
        if (pos.x < CENTER.x && pos.y < CENTER.y) {
            console.log('top left');
            this.playTurn(0);
        } else if (pos.x > CENTER.x && pos.y < CENTER.y) {
            this.playTurn(1);
            console.log('top right');
        } else if (pos.x < CENTER.x && pos.y > CENTER.y) {
            this.playTurn(2);
            console.log('bottom left');
        } else if (pos.x > CENTER.x && pos.y > CENTER.y) {
            this.playTurn(3);
            console.log('bottom right');
        }
    }
    playTurn(q) {
        if (this.playerSequence.length < this.sequence.length) {
            let turn = this.turn;
            let correct = this.checkCorrect(q, turn);
            if (correct) {
                this.activateQuadrant(q);
                this.score++;
                this.checkPlayerSequenceFull();
            } else {
                error.play();
                this.score = this.score - this.playerSequence.length;
                this.playerSequence = [];
                this.turn = 0;
                if (!this.strictMode) {
                    alertify
                        .okBtn('Try Again')
                        .cancelBtn('Restart Game')
                        .confirm(`that's not right... try this level again or restart game?`,
                            () => {
                                this.removeListeners();
                                this.animateSequence();
                            },
                            () => {
                                this.startGame();
                            })
                } else {
                    alertify
                        .okBtn('Yes')
                        .cancelBtn('No')
                        .confirm('You have died of dysentery.<br><br>Restart?',
                            () => {
                                this.startGame();
                            },
                            () => {
                                this.removeListeners();
                                this.animateSequence();
                            });
                }
            }
        } else {
            console.log('wait your turn');
        }
    }
    checkPlayerSequenceFull() {
        if (this.playerSequence.length === this.sequence.length) {
            if (this.playerSequence.length >= 20) {
                this.removeListeners();
                this.clearData();
                alertify
                    .okBtn('Yes')
                    .cancelBtn('No')
                    .confirm('You have won! <br> Play again?',
                        () => {
                            this.startGame();
                        },
                        () => {
                            return;
                        });
            } else {
                this.removeListeners();
                this.turn++;
                let self = this;
                setTimeout(() => {
                    this.turn = 0;
                    this.playerSequence = [];
                    this.round++;
                    self.newRound();
                }, this.pulse);
            }
        } else {
            this.turn++;
            return;
        }
    }
    checkCorrect(q, turn) {
        let seqItem = this.sequence[turn];
        if (q === seqItem) {
            this.playerSequence.push(q);
            return true;
        } else {
            return false;
        }
    }
    clearData() {
        this.sequence = [];
        this.playerSequence = [];
        this.round = 0;
        this.turn = 0;
        this.active = false;
    }
    addListeners() {
        this.active = true;
        canvas.addEventListener('mousedown', onMouseDown);
    }
    removeListeners() {
        this.active = false;
        canvas.removeEventListener('mousedown', onMouseDown);
    }
    drawOutline() {
        ctx.strokeStyle = '#292929';
        ctx.lineWidth = 18;
        // horizontal and vertical lines
        ctx.beginPath();
        ctx.moveTo(this.center.x, this.center.y);
        ctx.lineTo(this.center.x, this.center.y - this.radius);
        ctx.moveTo(this.center.x - this.radius, this.center.y);
        ctx.lineTo(this.center.x, this.center.y);
        ctx.lineTo(this.center.x, this.center.y + this.radius);
        ctx.moveTo(this.center.x + this.radius, this.center.y);
        ctx.lineTo(this.center.x, this.center.y);
        ctx.stroke();
        // circle outline
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
    randomNumber() {
        return Math.floor((Math.random() * 4));
    }
}

let red = new Quadrant(Math.PI, Math.PI * 1.5, '#aa3939');
let green = new Quadrant(Math.PI * 1.5, Math.PI * 2, '#2d882d');
let blue = new Quadrant(Math.PI * 2, Math.PI * 2.5, '#2e4272');
let yellow = new Quadrant(Math.PI * 2.5, Math.PI * 3, '#aa8439');

let Simon = new Game([red, green, yellow, blue]);

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    }
}

function onMouseDown(e) {
    let pos = getMousePos(canvas, e);
    let bounds = {
        left: CENTER.x - RADIUS,
        right: CENTER.x + RADIUS,
        top: CENTER.y - RADIUS,
        bottom: CENTER.y + RADIUS
    }
    let xBounds = pos.x < bounds.right && pos.x > bounds.left;
    let yBounds = pos.y < bounds.bottom && pos.y > bounds.top;
    let inBounds = xBounds && yBounds;
    if (inBounds) {
        Simon.registerClick(pos);
    }
}

window.onload = function() {
    Simon.initialize();
    let welcomeMessage = `
        <h1 class="alertify-header">
          <span class="s">S</span>
          <span class="i">I</span>
          <span class="m">M</span>
          <span class="o">O</span>
          <span class="n">N</span>
        </h1>
        <hr class="message-hr">
        <blockquote class="gameplay">
          Replicate the sequence to advance to the next round. If you fail, the computer will replay the sequence and you may try again. Turning on strict mode will remove this behavior. The sequence length will increase by one after each round. Complete a sequence of 20 to 'beat the game'.
        </blockquote>
        <hr class="message-hr">
        <h4 class="alertify-subheader">&copy; James Jarvis 2016</h4>
        `;
    alertify
        .okBtn('Play')
        .confirm(welcomeMessage,
            () => {
                Simon.startGame();
            },
            () => {
                window.history.back();
            });
}
window.addEventListener('resize', () => {
    window.location.reload();
});

canvas.addEventListener('mousedown', (e) => {
    let pos = getMousePos(canvas, e);
    let strictModeToggle = pos.x > 50 && pos.y > 50 && pos.x < 200 && pos.y < 100;

    let restartGameToggle = pos.x > 50 && pos.y > 125 && pos.x < 200 && pos.y < 175;

    if (strictModeToggle) {
        let ok = Simon.strictMode ? 'Turn Off' : 'Turn On';
        let cancel = 'Cancel';
        let activate = Simon.strictMode ? 'DEACTIVATE' : 'ACTIVATE';
        alertify
            .okBtn(ok)
            .cancelBtn(cancel)
            .confirm(`There are no second chances with the strict difficulty. Any mistakes and it's game over. This can be either incredibly fun or incredibly frustrating.<br><br> Are you sure you would like to ${activate} strict mode? The game will be reset.`,
                () => {
                    Simon.strictMode = !Simon.strictMode;
                    Simon.drawStrictModeToggle();
                    Simon.startGame();
                },
                () => {
                    Simon.animateSequence();
                });
    }
    if (restartGameToggle) {
        alertify
            .okBtn('Yes')
            .cancelBtn('No')
            .confirm('Restart?', () => {
                    Simon.startGame();
                },
                () => {
                    return;
                });
    }
});
