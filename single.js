require('dotenv').config()
const fs = require('fs')
let Sentry
if (process.env.ENABLESENTRY) {
    Sentry = require('@sentry/node')
    Sentry.init({ dsn: process.env.SENTRY_DSN })
} else {
    Sentry.captureException = console.log
}
const Eris = require('eris')
const clientOptions = {
    disableEvents: {
        GUILD_BAN_ADD: true,
        GUILD_BAN_REMOVE: true,
        MESSAGE_DELETE: true,
        MESSAGE_DELETE_BULK: true,
        MESSAGE_UPDATE: true,
        TYPING_START: true,
        VOICE_STATE_UPDATE: true
    },
    messageLimit: 0,
    guildSubscriptions: false,
    restMode: true
}
var bot = new Eris(process.env.DISCORD_TOKEN, clientOptions)

bot.sentry = Sentry
bot.db = require('./modules/db')
bot.recent = {}
bot.pages = {}
bot.cmds = {}
bot.dialogs = {}
bot.owner = process.env.DISCORD_OWNERID
try {
    bot.blacklist = require('./modules/blacklist.json')
} catch (e) {
    bot.blacklist = []
}
//require('./modules/ipc')(bot)
require('./modules/util')(bot)

let files = fs.readdirSync('./commands')
files.forEach(file => {
    if (file.endsWith('.js')) bot.cmds[file.slice(0, -3)] = require('./commands/' + file)
})

files = fs.readdirSync('./events')
files.forEach(file => {
    bot.on(file.slice(0, -3), (...args) => require('./events/' + file)(...args, bot))
})

process.on('message', message => {
    if (bot.ipc[message.name]) bot.ipc[message.name](message)
})

setInterval(bot.updateStatus, 3600000) //every hour
bot.updateStatus()

if (!process.env.DISCORD_INVITE) {
    delete bot.cmds.invite
}

bot.connect()
