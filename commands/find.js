const { article, proper } = require('../modules/lang')

module.exports = {
    help: cfg => 'Find and display info about ' + cfg.lang + 's by name',
    usage: cfg => ['find <name> - Attempts to find ' + article(cfg) + ' ' + cfg.lang + ' with exactly the given name.'],
    permitted: msg => true,
    groupArgs: true,
    execute: async (bot, msg, args, cfg) => {
        if (!args[0]) return bot.cmds.help.execute(bot, msg, ['find'], cfg)

        //do search
        
        let search = args.join(' ')
        let targets
        if (msg.channel.type == 1) targets = [msg.author.id]
        else {
            targets = []
            let amtFound = 1000
            let lastId = 0
            while (amtFound == 1000) {
                let found = await msg.channel.guild.getRESTMembers(1000, lastId)
                amtFound = found.length
                if (found.length > 0) lastId = found[found.length - 1].id
                targets = targets.concat(found.map(m => m.id))
            }
        }
        let results = (await bot.db.findByName(search)) || []
        //TODO: fix search "SELECT * FROM Members WHERE user_id IN (select(unnest($1::text[]))) AND (CASE WHEN tag IS NULL THEN LOWER(name) LIKE '%' || $2 || '%' ELSE (LOWER(name) || LOWER(tag)) LIKE '%' || $2 || '%' END)",[targets, search]

        if (!results[0]) return "Couldn't find " + article(cfg) + ' ' + cfg.lang + ' with that name.'

        //return single match
        if (results.length == 1) {
            let t = results[0]
            let host = bot.users.get(t.user_id)
            let group = null //groups disabled
            if (t.group_id) group = {} //(await bot.db.query('SELECT name FROM Groups WHERE id = $1', [t.group_id])).rows[0]
            let embed = {
                embed: {
                    author: {
                        name: t.name,
                        icon_url: t.url
                    },
                    description: `Host: ${host ? host.username + '#' + host.discriminator : 'Unknown user ' + t.host}\n${bot.generateMemberField(t, group).value}`
                }
            }
            return embed
        }

        //build paginated list of results
        let embeds = []
        let current = {
            embed: {
                title: 'Results',
                fields: []
            }
        }
        for (let i = 0; i < results.length; i++) {
            let t = results[i]
            if (current.embed.fields.length >= 5) {
                embeds.push(current)
                current = {
                    embed: {
                        title: 'Results',
                        fields: []
                    }
                }
            }
            let group = null //groups disabled
            if (t.group_id) group = {} //(await bot.db.query('SELECT name FROM Groups WHERE id = $1', [t.group_id])).rows[0]
            let host = bot.users.get(t.user_id)
            current.embed.fields.push({ name: t.name, value: `Host: ${host ? host.username + '#' + host.discriminator : 'Unknown user ' + t.host}\n${bot.generateMemberField(t, group).value}` })
        }

        embeds.push(current)
        if (embeds.length > 1) {
            for (let i = 0; i < embeds.length; i++) embeds[i].embed.title += ` (page ${i + 1}/${embeds.length} of ${results.length} results)`
            return bot.paginate(msg, embeds)
        }
        return embeds[0]
    }
}
