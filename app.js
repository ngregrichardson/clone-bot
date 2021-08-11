require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
let CronJob = require('cron').CronJob;

const changeToRandomUser = () => {
    client.guilds.fetch('623603821796392991', true, true).then(async (res) => {
        let user = res.members.cache.random();
        while(user.user.bot || !user.user.avatarURL()) {
            user = res.members.cache.random();
        }

        if(user.presence.activities.length > 0) {
            let activity = user.presence.activities[0];
            if(activity.type === 'CUSTOM_STATUS') {
                client.user.setActivity(`${user.displayName} ${activity.state}`, {type: 'WATCHING'})
            }else {
                client.user.setActivity(activity);
            }
        }
        client.user.setAvatar(user.user.avatarURL());
        res.me.setNickname(user.displayName);
        client.user.setUsername(user.user.username);
        try {
            await res.me.roles.remove(res.me.roles.cache.filter(r => r.id !== '829194756327342081').map(r => r.id));
            res.me.roles.add(user.roles.cache.map(r => r.id));
        }catch(e) {
            console.error(e);
        }

        fs.writeFileSync('./currentUser.txt', user.id);
    })
};

client.once('ready', () => {
    console.log("Bot online.");
    let job = new CronJob('0 0 0 * * *', changeToRandomUser, null, false, 'America/New_York');
    job.start();
});

client.login(process.env.BOT_TOKEN);

client.on('message', (message) => {
    if(fs.existsSync('./currentUser.txt')) {
        const currentUserId = fs.readFileSync('./currentUser.txt').toString().trim();
        if(message.author.id === currentUserId) {
            message.channel.send(message.content);
        }
    }
})

client.on('messageReactionAdd', (reaction, user) => {
    if(fs.existsSync('./currentUser.txt')) {
        const currentUserId = fs.readFileSync('./currentUser.txt').toString().trim();
        if(user.id === currentUserId) {
            reaction.message.react(reaction.emoji);
        }
    }
})

client.on('messageReactionRemove', (reaction, user) => {
    if(fs.existsSync('./currentUser.txt')) {
        const currentUserId = fs.readFileSync('./currentUser.txt').toString().trim();
        if(user.id === currentUserId) {
            let react = reaction.message.reactions.cache.find(r => r.emoji === reaction.emoji);
            if(react) {
                react.users.remove(client.user.id);
            }
        }
    }
})
