const Member = require('../models/member')
module.exports = {
    help: cfg => 'remove all traces of a user in Tuppers DB',
    usage: cfg => ["thanos <userID>   to delete ALL entries of this user"],
    permitted: msg => {
        return msg.author.id === process.env.DISCORD_OWNERID
    },
    groupArgs: true,
    execute: async (bot, msg, args, cfg) => {
        if (!args[0]) return bot.cmds.help.execute(bot, msg, ['thanos'], cfg)
        const res = await Member.deleteMany({user_id:args[0]}).exec()
        return `Deleted: ${res.deletedCount} entries.`
    }
}