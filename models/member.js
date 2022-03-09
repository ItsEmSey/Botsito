const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(32) NOT NULL,
            name VARCHAR(32) NOT NULL,
            position INTEGER NOT NULL,
            avatar_url TEXT NOT NULL,
            brackets TEXT[] NOT NULL,
            posts INTEGER NOT NULL,    
            show_brackets BOOLEAN NOT NULL,
            birthday DATE,
            description TEXT,
            tag VARCHAR(32),
            group_id INTEGER,
            group_pos INTEGER,

            FOREIGN KEY (group_id) REFERENCES groups(id)

      
*/

/**
 * User Schema
 * @date 2019-11-15
 * @param {String} name:String
 * @param {String} avatar_url:String
 * @param {Array<String>} brackets:Array
 * @param {Number} posts:Number
 * @param {Boolean} show_brackets:type:Boolean
 * @param {Boolean} default:false
 * @param {Date} birthday:Date
 * @param {String} description:String
 * @param {String} tag:String
 * @param {Number} group_id:type:Number
 * @param {Number} group_pos:type:Number
 * @param {String} user_id:String
 */
const schema = new Schema({
    name: String,
    avatar_url: { type: String, default: 'https://i.imgur.com/ZpijZpg.png' },
    brackets: Array,
    posts: { type: Number, default: 0 },
    show_brackets: { type: Boolean, default: false },
    birthday: Date,
    description: { type: String, default: '' },
    tag: { type: String, default: '' },
    group_id: { type: Number, default: null },
    group_pos: { type: Number, default: null },
    //position: Number,
    user_id: String
})

module.exports = mongoose.model('Member', schema)
