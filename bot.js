const fs = require('fs')
let Sentry
if (process.env.ENABLESENTRY) {
    Sentry = require('@sentry/node')
    Sentry.init({ dsn: process.env.SENTRY_DSN })
} else {
    Sentry.captureException = console.log
}

const Base = require('eris-sharder').Base

class Tupperbox extends Base {
    constructor(bot) {
        super(bot)
    }

    launch() {
        let bot = this.bot
        bot.base = this
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
        require('./modules/ipc')(bot)
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

        setInterval(bot.updateStatus, 1000*60*10) //every 10 min
        bot.updateStatus()

        if (!process.env.DISCORD_INVITE) {
            delete bot.cmds.invite
        }
    }
}

module.exports = Tupperbox
