const request = require('got')

module.exports = {
    help: cfg => 'Import your data from a file',
    usage: cfg => ['import - Attach a compatible .json file when using this command. Data files can be obtained from compatible bots like me and Pluralkit.'],
    permitted: () => true,
    desc: cfg =>
        'Importing data acts as a merge, meaning if there are any ' +
        cfg.lang +
        's already registered with the same name as one being imported, the values will be updated instead of registering a new one.',
    execute: async (bot, msg, args, cfg) => {
        let file = msg.attachments[0]
        if (!file) return 'Please attach a .json file to import when running this command.\nYou can get a file by running the export command from me or Pluralkit.'
        let data
        try {
            data = JSON.parse((await request(msg.attachments[0].url)).body)
        } catch (e) {
            return 'Please attach a valid .json file.'
        }

        try {
            await bot.send(
                msg.channel,
                "Warning: This will overwrite your data. Only use this command with a recent, untampered .json file generated from the export command from either me or PluralKit. Please reply 'yes' if you wish to continue."
            )
            let response = await bot.waitMessage(msg)
            if (response.content.toLowerCase() != 'yes') return 'Canceling operation.'
        } catch (e) {
            if (e == 'timeout') return 'Response timed out. Canceling.'
            else throw e
        }
        let uid = msg.author.id
        if (data.tuppers) {
            //tupperbox file
            if (data.tuppers.length > 3000 || data.groups.length > 500) {
                return 'Data too large for import. Please visit the support server for assistance: https://discord.gg/6WF6Z5m'
            }
            let tups = data.tuppers
            let groups = data.groups
            try {
                let added = 0
                let updated = 0 //groups disabled
                // let oldGroups = (await bot.db.query('SELECT id, name, description, tag FROM Groups WHERE user_id = $1 ORDER BY position', [msg.author.id])).rows
                // for (let i = 0; i < groups.length; i++) {
                //     let g = groups[i]
                //     let old = oldGroups.find(gr => g.name == gr.name) || {}
                //     if (!old.name) {
                //         //update existing entry
                //         added++
                //         await bot.db.addGroup(uid, g.name)
                //     } else updated++
                //     await bot.db.query('UPDATE Groups SET description = $1, tag = $2 WHERE user_id = $3 AND name = $4', [g.description || null, g.tag || null, uid, g.name])
                // }
                let oldTups = await bot.db.getMembers(msg.author.id)
                for (let i = 0; i < tups.length; i++) {
                    let t = tups[i]
                    let old = oldTups.find(tu => t.name == tu.name) || {}
                    if (!old.name) {
                        //update existing entry
                        added++
                        await bot.db.addMember(uid, t.name, t.brackets)
                    } else updated++
                    await bot.db.fullMemberUpdate(
                        {
                            user_id: uid,
                            name: t.name
                        },
                        {
                            avatar_url: t.avatar_url || old.avatar_url || 'https://i.imgur.com/ZpijZpg.png',
                            show_brackets: t.show_brackets || false,
                            posts: Math.max(old.posts || 0, t.posts || 0),
                            birthday: t.birthday || null,
                            description: t.description || null,
                            tag: t.tag || null,
                            brackets: t.brackets || old.brackets
                            //group not set cuz disabled
                        }
                    )
                    //groups disabled
                    // if (old.group_id != t.group_id) {
                    //     let grp = groups.find(g => g.id == t.group_id)
                    //     let validGroup = grp ? await bot.db.getGroup(uid, grp.name) : null
                    //     if (validGroup)
                    //         await bot.db.query(
                    //             'UPDATE Members SET group_id = $1, group_pos = (SELECT GREATEST(COUNT(group_pos),MAX(group_pos)+1) FROM Members WHERE group_id = $1) WHERE user_id = $2 AND name = $3',
                    //             [validGroup.id, uid, t.name]
                    //         )
                    // }
                }
                return `Import successful. Added ${added} entries and updated ${updated} entries.`
            } catch (e) {
                bot.err(msg, e, false)
                return `Something went wrong importing your data. This may have resulted in a partial import. Please check the data and try again. (${e.code || e.message})`
            }
        } else if (data.switches) {
            //pluralkit file
            if (data.members.length > 3000) {
                return 'Data too large for import. Please visit the support server for assistance: https://discord.gg/6WF6Z5m'
            }
            try {
                let sysName = data.name || msg.author.username
                //groups disabled
                // let systemGroup = await bot.db.getGroup(uid, sysName)
                // if (!systemGroup) {
                //     await bot.db.addGroup(uid, sysName)
                //     await bot.db.query('UPDATE Groups SET description = $1, tag = $2 WHERE user_id = $3 AND name = $4', [data.description || null, data.tag || null, uid, sysName])
                //     systemGroup = await bot.db.getGroup(uid, sysName)
                // }
                let tups = data.members
                let added = 0
                let updated = 0
                let oldTups = await bot.db.getMembers(msg.author.id)
                for (let i = 0; i < tups.length; i++) {
                    let t = tups[i]
                    let old = oldTups.find(tu => t.name == tu.name) || {}
                    let newBrackets = t.proxy_tags.length == 0 ? [`${t.name}:`, ''] : t.proxy_tags.map(pt => [pt.prefix || '', pt.suffix || '']).reduce((acc, val) => acc.concat(val), [])
                    if (!old.name) {
                        //update existing entry
                        added++
                        await bot.db.addMember(uid, t.name, newBrackets)
                    } else updated++
                    await bot.db.fullMemberUpdate(
                        {
                            user_id: uid,
                            name: t.name
                        },
                        {
                            avatar_url: t.avatar_url || old.avatar_url || 'https://i.imgur.com/ZpijZpg.png',
                            posts: t.message_count || 0,
                            birthday: t.birthday || null,
                            description: t.description || null,
                            brackets: newBrackets,
                            tag: t.tag || null
                            //group not set cuz disabled
                        }
                    )
                }
                //
                //let systemGroupTups = await bot.db.query('SELECT COUNT(name) FROM Members WHERE group_id = $1', [systemGroup.id])
                //if (systemGroupTups.rows[0].count == 0) await bot.db.deleteGroup(uid, sysName)
                return `Import successful. Added ${added} entries and updated ${updated} entries.`
            } catch (e) {
                bot.err(msg, e, false)
                return `Something went wrong importing your data. This may have resulted in a partial import. Please check the data and try again. (${e.code || e.message})`
            }
        } else return 'Unknown file format. Please notify the creator by joining the support server.'
    }
}
