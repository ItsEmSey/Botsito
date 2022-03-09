const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    id: Number,
    prefix: String,
    lang: String,
    log_channel: Number,
    lang_plural: String
})

module.exports = mongoose.model('Server', schema)
