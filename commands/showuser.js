module.exports = {
    help: cfg => 'Show the user that registered the ' + cfg.lang + ' that last spoke',
    usage: cfg => ['showuser - Finds the user that registered the ' + cfg.lang + ' that last sent a message in this channel'],
    permitted: msg => true,
    execute: (bot, msg, args, cfg) => {
        if (!bot.recent[msg.channel.id]) return 'No ' + cfg.lang + 's have spoken in this channel since I last started up, sorry.'

        return `Last ${cfg.lang} message sent by ${bot.recent[msg.channel.id][0].rawname}, registered to ${bot.recent[msg.channel.id][0].tag}`
    }
}
