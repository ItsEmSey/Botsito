module.exports = {
    help: cfg => 'Gets list of Aliases',
    usage: cfg => ['charlist', "charlist cb for putting it into code blocks"],
    permitted: msg => {
        return msg.author.id === process.env.DISCORD_OWNERID
    },
    groupArgs: true,
    execute: async (bot, msg, args, cfg) => {
        if (args[0] == "?") return bot.cmds.help.execute(bot, msg, ['charlist'], cfg)
        let code = false
        if (args[0] == "cb") code = true


        //needed for user to resolve properly
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
        
        function host(id) {
            usr =  bot.users.get(id)
            if (!usr) return`Could not Resolve ${id}`
            return usr.username
        };
        function hyphens(count) {return "-".repeat(count)}

        //get list of userids and their aliases
        let userlist = await bot.db.getList()
        //resolve hosts
        userlist = userlist.map(user=>{
            return {username:host(user.id),names:user.names}
        })

        //create array of pretty lines for each user
        charlist = []
        userlist.forEach(user => {
            let userText = []
            userText.push(`---  ${user.username}  ---`)
            userText.push(...(user.names))
            userText.push(hyphens(user.username.length+10)+"\n")
            charlist.push(userText.join("\n"))
        });
        
        //queue messages in blocks of under 2k chars
        let messages = []
        messages.push({chan: msg.channel, msg:"char list"})
        under2k = ""
        for (let userIndex = 0; userIndex < charlist.length; userIndex++) {
            const currentUser = charlist[userIndex];
            if(under2k.length+currentUser.length<1990){
                under2k+=currentUser+"\n"
            } else{
                messages.push({chan: msg.channel, msg:under2k})
                under2k = currentUser+"\n"
            }
        }
        if(under2k) messages.push({chan: msg.channel, msg: under2k})

        //send em off
        return await sendNow(messages, code)

        
        function sleep(millis) {return new Promise(resolve => setTimeout(resolve, millis));}
        function sendNow(messages, code){
            return new Promise(async (resolve, reject) => {
                for (let msg = 0; msg < messages.length; msg++) {
                    const currentMessage = messages[msg];
                    let gravis =""
                    if (msg !=0 && code) gravis="```"
                    await bot.send(currentMessage.chan, `${gravis}${currentMessage.msg}${gravis}`)
                    await sleep(1000)
                }
                resolve()
            });
        }
    }
}