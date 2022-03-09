const mongoose = require('mongoose')
const Member = require('../models/member')
const Group = require('../models/group')
const Webhook = require('../models/webhook')
const Server = require('../models/server')

//test
//mongoose.connect(`mongodb://127.0.0.1:27017/Tupper`, { useNewUrlParser: true })

//prod
mongoose.connect(`mongodb://${process.env.MONGOHOST}:${process.env.MONGOPORT}/${process.env.DBNAME}`, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function() {
    console.log('MongoDB Connected')
})

module.exports = {
    init: async () => {},

    query: (text, params, callback) => {
        throw new Error('what the fuck are u doing use the god damn db module')
    },

    addMember: async (user_id, name, brackets) => {
        let member = new Member({
            user_id,
            name,
            brackets
        })
        return member.save()
    },

    fullMemberUpdate: async (identifyBy, data) => {
        Member.updateOne(identifyBy, {
            $set: data
        }).exec()
    },

    getMember: async findBy => {
        if (typeof findBy != 'object') throw new Error('Invalid type passed:' + typeof findBy + " Expected type 'object'")
        return Member.findOne(findBy).exec()
    },
    getMembers: async user_id => {
        return Member.find({ user_id }).exec()
    },
    getList: async () => {
        var members = await Member.find({}).exec()
        var ids = members.map(member => member.user_id)
        var uniqueIds = ids.filter(function(elem, pos) {
            return ids.indexOf(elem) == pos
        })
        var users = uniqueIds.map(id => {
            var names = members
                .filter(member => {
                    return member.user_id == id
                })
                .map(a => a.name)
            return { id, names }
        })
        return users
    },
    findByName: async name => {
        return Member.find({ name }).exec()
    },
    deleteMemberIds: async user_id => {
        return Member.deleteMany({ user_id }).exec()
    },
    clearTags: async user_id => {
        return Member.updateMany({ user_id }, { $set: { tag: null } }).exec()
    },
    memberCount: async () => {
        return Member.countDocuments().exec()
    },
    /**
     * Update user
     * @date 2019-11-15
     * @param {any} userID
     * @param {any} name
     * @param {Object} data where key == field and value == value to set eg: {avatar_url: "link"}
     */
    updateMember: async (user_id, name, data) => {
        await Member.updateOne({ user_id, name }, { $set: data }).exec()
        //return await pool.query(`UPDATE Members SET ${column} = $1 WHERE user_id = $2 AND LOWER(name) = LOWER($3)`, [newVal, userID, name])
    },

    deleteMember: async (user_id, name) => {
        await Member.deleteOne({ user_id, name }).exec()
        //return await pool.query('DELETE FROM Members WHERE user_id = $1 AND LOWER(name) = LOWER($2)', [userID, name])
    },

    mergeMember: async () => {},

    // not needed we only use one server
    // addCfg: async serverID => {
    //    return pool.query('INSERT INTO Servers(id, prefix, lang) VALUES ($1, $2, $3)', [serverID, 'tul!', 'tupper'])
    // },

    getCfg: id => {
        return Server.findOne({ id }).exec()
    },

    // updateCfg: async (serverID, column, newVal) => {
    //     await pool.query('INSERT INTO Servers(id, prefix, lang) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;', [serverID, 'tul!', 'tupper'])
    //    return pool.query(`UPDATE Servers SET ${column} = $1 WHERE id = $2`, [newVal, serverID])
    // },

    // deleteCfg: async serverID => {
    //    return pool.query('DELETE FROM Servers WHERE id = $1', [serverID])
    // },

    // getBlacklist: async serverID => {
    //     return (await pool.query('SELECT * FROM Blacklist WHERE server_id = $1', [serverID])).rows
    // },

    // updateBlacklist: async (serverID, id, isChannel, blockProxies, blockCommands) => {
    //    return pool.query(

    //         'INSERT INTO Blacklist VALUES ($1,$2,$3,CASE WHEN $4::BOOLEAN IS NULL THEN false ELSE $4::BOOLEAN END,CASE WHEN $5::BOOLEAN IS NULL THEN false ELSE $5::BOOLEAN END) ON CONFLICT (id,server_id) DO UPDATE SET block_proxies = (CASE WHEN $4::BOOLEAN IS NULL THEN Blacklist.block_proxies ELSE EXCLUDED.block_proxies END), block_commands = (CASE WHEN $5::BOOLEAN IS NULL THEN Blacklist.block_commands ELSE EXCLUDED.block_commands END)',
    //         [id, serverID, isChannel, blockProxies, blockCommands]
    //     )
    // },

    // deleteBlacklist: async (serverID, id) => {
    //    return pool.query('DELETE FROM Blacklist WHERE server_id = $1 AND id = $2', [serverID, id])
    // },

    isBlacklisted: async (serverID, id, proxy) => {
        return false //or true idk
        //if (proxy) return (await pool.query('SELECT block_proxies, block_commands FROM Blacklist WHERE server_id = $1 AND id = $2 AND block_proxies = true', [serverID, id])).rows[0] != undefined
        //else return (await pool.query('SELECT block_proxies, block_commands FROM Blacklist WHERE server_id = $1 AND id = $2 AND block_commands = true', [serverID, id])).rows[0] != undefined
    },

    getGroup: async (userID, name) => {
        throw new new Error('Not implemented')()
        //return (await pool.query('SELECT * FROM Groups WHERE user_id = $1 AND LOWER(name) = LOWER($2)', [userID, name])).rows[0]
    },

    getGroups: async userID => {
        throw new new Error('Not implemented')()
        //return (await pool.query('SELECT * FROM Groups WHERE user_id = $1', [userID])).rows
    },

    addGroup: async (userID, name) => {
        throw new new Error('Not implemented')()
        //return await pool.query(
        //    'INSERT INTO Groups (user_id, name, position) VALUES ($1::VARCHAR(32), $2, (SELECT GREATEST(COUNT(position),MAX(position)+1) FROM Groups WHERE user_id = $1::VARCHAR(32)))',
        //    [userID, name]
        //)
    },

    updateGroup: async (userID, name, column, newVal) => {
        throw new new Error('Not implemented')()
        //return await pool.query(`UPDATE Groups SET ${column} = $1 WHERE user_id = $2 AND LOWER(name) = LOWER($3)`, [newVal, userID, name])
    },

    deleteGroup: async (userID, name) => {
        throw new new Error('Not implemented')()
        //return await pool.query('DELETE FROM Groups WHERE user_id = $1 AND LOWER(name) = LOWER($2)', [userID, name])
    },

    deleteWebhook: async channel_id => {
        return Webhook.deleteOne({ channel_id }).exec()
    },

    getWebhook: channel_id => {
        return Webhook.find({ channel_id }).exec()
    },
    getAllWebhooks: channel_id => {
        return Webhook.find({}).exec()
    },
    createWebhook: async (id, channel_id, token) => {
        let hook = new Webhook({
            id,
            channel_id,
            token
        })
        return hook.save()
    },

    end: async () => {
        return db.close()
    }
}
