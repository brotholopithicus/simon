const mongoose = require('mongoose');
const faker = require('faker');

const db = mongoose.connect('mongodb://localhost:27017/scores');

let scores = [];
for (var i = 0; i < 10; i++) {
    let newScore = {
        name: faker.name.firstName(),
        score: faker.random.number()
    }
    scores.push(newScore);
}

const scoreSchema = {
    name: String,
    score: Number
}

let Score = mongoose.model('Score', scoreSchema);

scores.forEach((score) => {
    let newScore = new Score(score);
    newScore.save((err, score) => {
        if (err) {
            console.error(err);
        }
        console.log('saved ', score);
    });
});
