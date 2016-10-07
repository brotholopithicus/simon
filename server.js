/* ========= MODULES ========= */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const mongoose = require('mongoose');
const Score = require('./models/Scores');

// connect to mongodb
mongoose.connect('mongodb://localhost:27017/scores');

// configure static files and views
app.use(express.static(path.join(__dirname + '/public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname + '/views'));

/* ========= ROUTES ========= */
// root
app.get('/', (req, res) => {
    res.render('index');
});

// api endpoint for high scores
app.get('/scores', (req, res) => {
    Score.find({}, (err, scores) => {
        if (err) throw err;
        console.log(scores);
        res.json(scores);
    });
});

/* ========= SOCKETS ========= */
// configure client / server socket events
io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('score', (newScore) => {
        let highScore = new Score(newScore);
        highScore.save((err) => {
            if (err) throw err;
            console.log('new score saved!', newScore);
            Score.find({}, (err, scores) => {
                if (err) throw err;
                io.emit('new score', scores);
            });

        });
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// LISTEN
server.listen(3000, () => {
    console.log('sever listening on port 3000');
});
