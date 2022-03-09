const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
          CREATE TABLE IF NOT EXISTS Groups(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(32) NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            tag VARCHAR(32),
            position INTEGER,
            UNIQUE (user_id, name)
*/

const schema = new Schema({
    //use _id
    name: {type: String, unique: true},
    description: String,
    tag: String,
    position: Number,
    user_id: {type: Number, unique: true}
})

module.exports = mongoose.model('Group', schema)
