const { article } = require('../modules/lang')
String.prototype.pretty = function () {
    return this.replace(/  +/g, "");
}

module.exports = {
    help: cfg => 'Print this message, or get help for a specific command',
    usage: cfg => ['help - print list of commands', 'help [command] - get help on a specific command'],
    permitted: () => true,
    execute: async (bot, msg, args, cfg) => {
        //help for a specific command
        if (args[0]) {
            if (bot.cmds[args[0]] && bot.checkPermissions(bot.cmds[args[0]], msg, args) && bot.cmds[args[0]].usage) {
                let output = {
                    embed: {
                        title: 'Bot Command | ' + args[0],
                        description: bot.cmds[args[0]].help(cfg) + '\n\n**Usage:**\n',
                        timestamp: new Date().toJSON(),
                        color: 0x999999,
                        author: {
                            name: 'Tupperbox',
                            icon_url: bot.user.avatarURL
                        },
                        footer: {
                            text:
                                `If something is wrapped in <> or [], do not include the brackets when using the command. They indicate whether that part of the command is required <> or optional [].`
                        }
                    }
                }
                for (let u of bot.cmds[args[0]].usage(cfg)) output.embed.description += `${cfg.prefix + u}\n`
                if (bot.cmds[args[0]].desc) output.embed.description += `\n${bot.cmds[args[0]].desc(cfg)}`
                return output
            }
            return 'Command not found.'
        }

        //general help
        let output = {
            embed: {
                title: 'Tupperbox | Help',
                description:
                    'I am Tupperbox, a bot that allows you to send messages as other pseudo-users using Discord webhooks.\nTo get started, register ' +
                    article(cfg) +
                    ' ' +
                    cfg.lang +
                    ' with `' +
                    cfg.prefix +
                    'register` and enter a message with the brackets you set!\nExample: `' +
                    cfg.prefix +
                    "register test [text]` to register with brackets as []\n`[Hello!]` to proxy the message 'Hello!'\n\n**Command List**\nType `" +
                    cfg.prefix +
                    'help command` for detailed help on a command.\n' +
                    String.fromCharCode(8203) +
                    '\n',
                color: 0x999999,
                author: {
                    name: 'Tupperbox',
                    icon_url: bot.user.avatarURL
                }
            }
        }
        for (let cmd of Object.keys(bot.cmds)) {
            if (bot.cmds[cmd].help && bot.cmds[cmd].permitted(msg, args)) output.embed.description += `**${cfg.prefix + cmd}**  -  ${bot.cmds[cmd].help(cfg)}\n`
        }
        output.embed.fields = [
            {
                name: '\u200b',
                value:
                    `Single or double quotes can be used in any command to specify multi-word arguments!
                    
                    Proxy tips:
                    React with \u274c to a recent proxy to delete it (if you sent it!)
                    React with \u2753 to a recent proxy to show who sent it in DM!
                    Info:
                    - This Bot Is Hosted by nakama.tv
                    ${process.env.DISCORD_INVITE
                        ? `- Invite the bot to your server --> [click](https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_INVITE}&scope=bot&permissions=536996928)`
                        : "- This Bot currently is not accepting/supporting to be invited into other servers"
                    }
                    - This Bot was Modified by GeneralUltra758 to use MongoDB [GitlabRepo](https://git.nakama.tv/GeneralUltra758/tupperbox/)`.pretty()
            }
        ]
        return output
    }
}
