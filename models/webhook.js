const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
  CREATE TABLE IF NOT EXISTS Webhooks(
            id VARCHAR(32) PRIMARY KEY,
            channel_id VARCHAR(32) NOT NULL,
            token VARCHAR(100) NOT NULL
          );
*/

/**
 * Webhook Schema
 * @date 2019-11-15
 * @param {any} id:String
 * @param {any} channel_id:String
 * @param {any} token:String
 * @returns {any}
 */

const schema = new Schema({
    id: String,
    channel_id: String,
    token: String
})

module.exports = mongoose.model('Webhook', schema)
