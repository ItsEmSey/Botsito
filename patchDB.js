require('dotenv').config()
const mongoose = require('mongoose')
const Member = require('../models/member')
mongoose.connect(`mongodb://${process.env.MONGOHOST}:${process.env.MONGOPORT}/${process.env.DBNAME}`, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function() {
    console.log('MongoDB Connected')
})

const dbf = {
    end: async () => {
        return db.close()
    },
    patch: {
        type: () => {
            return new Promise((resolve, reject) => {
                Member.find({ user_id: { $type: 'number' } })
                    .exec()
                    .then(async a => {
                        for (let i = 0; i < a.length; i++) {//using for so we can await each operation
                            const x = a[i];
                            console.log('Patching id type for tupper: ' + x.name)
                            x.user_id = String(x.user_id)
                            x.markModified("user_id");
                            await x.save()
                        }
                        resolve()
                    })
            })
        },
        id: (wrongId, correctId) => {
            return new Promise((resolve, reject) => {
                if (typeof correctId != 'string') correctId = correctId.toString()
                if (typeof wrongId != 'string') wrongId = wrongId.toString()
                Member.find({ user_id: wrongId })
                    .exec()
                    .then(async a => {
                        for (let i = 0; i < a.length; i++) {
                            const x = a[i];
                            console.log('Patching wrong Id for tupper: ' + x.name)
                            x.user_id = correctId
                            await x.save()
                        }
                        resolve()
                    })
            })
        }
    }
}
function sleep(millis) {return new Promise(resolve => setTimeout(resolve, millis));}

const idDict = [
    //[wrongIdInDb, correctUserId]
    ["", ""]
]

async function patchStuff(){
    await sleep(1000)
    console.log("patching types")
    await dbf.patch.type()
    console.log("patching Ids")
    for (let i = 0; i < idDict.length; i++) {
        const e = idDict[i];
        await dbf.patch.id(e[0],e[1])
    }
    console.log("done")
    await sleep(500)
    dbf.end()
}
patchStuff()