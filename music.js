const Discord = require("discord.js");

module.exports.run = async (client) => {

    const express = require("express");
    var app = express();
    var errorlog = require("../errors.json")
    const yt = require('ytdl-core');
    /*
    var RedisSessions = require("redis-sessions");
    var rs = new RedisSessions();
    */
    var ffmpeg = require("ffmpeg-binaries");
    var search = require('youtube-search');
    var con = console.log;
    queues = {},
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    opts = {
        part: 'snippet',
        maxResults: 10,
        key: process.env.youtube_api_key
    }
    var intent;
    function getQueue(guild) {
        if (!guild) return
        if (typeof guild == 'object') guild = guild.id
        if (queues[guild]) return queues[guild]
        else queues[guild] = []
        return queues[guild]
    }
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * (max + 1));
    }
    
    fighting = new Set();
    
    app.get("/queue/:guildid",function(req,res){
      let queue = getQueue(req.params.guildid);
        if(queue.length == 0) return res.send("Uh oh... No music!");
        let text = '';
        for(let i = 0; i < queue.length; i++){
          text += `${(i + 1)}. ${queue[i].title} | by ${queue[i].requested}\n`    };
      res.send(text)
    })
            
    
                
    var util = require('util');
    var youtube_node = require('youtube-node');
    
    
    
    var request = require('request')


    var prefix = 'M';

client.on("message", function(message) {
    var paused = {};
function play(message, queue, song) {
try {
if (!message || !queue) return;
if (song) {
    search(song, opts, function(err, results) {
       
        if (err) return message.channel.send("Video not found please try to use a youtube link instead."); 
        
        song = (song.includes("https://" || "http://")) ? song : results[0].link
        let stream = ytdl(song, {
            audioonly: true
        })
        let test
        if (queue.length === 0) test = true
        queue.push({
            "title": results[0].title,
            "requested": message.author.username,
            "toplay": stream,
"link": results[0].link,
        })

        console.log("Queued " + queue[queue.length - 1].title + " in " + message.guild.name + " as requested by " + queue[queue.length - 1].requested)
    
if(message.content.includes(`${prefix}repeat`)){     
message.channel.send("**:ballot_box_with_check: Re-add to queue - ** `" + queue[queue.length - 1].title + "`");
}else{
message.channel.send("**:mag_right: Searching  - ** `" + message.content.substr(6) + "`");
        message.channel.send("**:ballot_box_with_check: Add to queue - ** `" + queue[queue.length - 1].title + "`");
}
    if (test) {
            setTimeout(function() {
                play(message, queue)
            }, 1000)
        }
    })
} else if (queue.length != 0) {
    
message.channel.send("**:notes: Now playing - ** `" + queue[0].title + "`** | Requested by ** `" + queue[0].requested + "`" + "\n" + queue[0].link);
console.log(`Lecture ${queue[0].title} Requested byr ${queue[0].requested} i ${message.guild.name}`);
    let connection = message.guild.voiceConnection
    if (!connection) return con("no connexion!");
    intent = connection.playStream(queue[0].toplay)

    intent.on('error', () => {
        queue.shift()
        play(message, queue)
    })
intent.on('end', () => {	
setTimeout(() => {
  if (queue.length > 0) { 
      queue.shift()
play(message, queue) 
      } 
}, 1000)

    })
    
} else {
    message.channel.send("No more music in queue!")
    
}
} catch (err) {
console.log("Error\n\n" + err.stack)
errorlog[String(Object.keys(errorlog).length)] = {
    "code": err.code,
    "error": err,
    "stack": err.stack
}
fs.writeFile("./errors.json", JSON.stringify(errorlog), function(err) {
    if (err) return con("Error");
});


}
}

const messagea = message.content
try {
if (message.channel.type === "dm") return;
if (message.author === client.user)

    if (message.guild === undefined) {
        message.channel.send("The bot only works in servers!")

        return;
    }

if (message.content.startsWith(prefix + 'play')) {

    if (!message.guild.voiceConnection) {
        
        if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel')
        
        message.member.voiceChannel.join()
    }
    let suffix = messagea.split(" ").slice(1).join(" ")
    
    if (!suffix) return message.channel.send('You need to specify a song link or a song name!')
    

    play(message, getQueue(message.guild.id), suffix)
}
if (message.content.startsWith(prefix + 'repeat')) {
let queue = getQueue(message.guild.id);
    var player = message.guild.voiceConnection.player.dispatcher
    if (!player || player.paused) return message.channel.send('No music m8, queue something with `' + prefix + 'play`');
        if (queue.length == 0) return message.channel.send(`No music in queue`).then(response => { response.delete(5000) });
        if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel')
        
    play(message, getQueue(message.guild.id), queue[0].link)
}
if (message.content.startsWith(prefix + 'leave')) {

    console.log('leave');
    if (!message.guild.voiceConnection) {
       
        if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel')
        
}
        var chan = message.member.voiceChannel;
       message.member.voiceChannel.leave();
        let queue = getQueue(message.guild.id);
        
        if (queue.length == 0) return message.channel.send(`**Successfully leaved channel**`);
        for (var i = queue.length - 1; i >= 0; i--) {
            queue.splice(i, 1);
        }
        message.channel.send(`Queue is cleared`).then(response => { response.delete(5000) });

        
    
}

if (message.content.startsWith(prefix + "clearQ")) {
 
        let queue = getQueue(message.guild.id);
        
        if (queue.length == 0) return message.channel.send(`:x: **No music in queue**`).then(response => { response.delete(5000) });
        
        for (var i = queue.length - 1; i >= 0; i--) {
            queue.splice(i, 1);
        }
        
        message.channel.send(":wastebasket: **Successfully cleared queue**");
        
    }
if (message.content.startsWith(prefix + 'skip')) {
  
if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel')
        let player = message.guild.voiceConnection.player.dispatcher
        if (!player || player.paused) return message.channel.send("Bot is not playing!").then(response => { response.delete(5000) });
        message.channel.send(':fast_forward: **Skipping song...**');
        player.end()
    

}

if (message.content.startsWith(prefix + 'pause')) {
  
        
            if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel').then(response => { response.delete(5000) });
            let player = message.guild.voiceConnection.player.dispatcher
            if (!player || player.paused) return message.channel.send("Bot is not playing!").then(response => { response.delete(5000) });
            player.pause();
            message.channel.send("**:pause_button: Pausing Music...**");
        
       
    } 
if (message.content.startsWith(prefix + 'volume')) {
 let suffix = message.content.split(" ")[1];
                
    var player = message.guild.voiceConnection.player.dispatcher
    if (!player || player.paused) return message.channel.send(':x: **No music in queue, to play** : `' + prefix + 'play`');
    
    if (!suffix) {
var player = message.guild.voiceConnection.player.dispatcher
        
        message.channel.send(`The current volume is ${(player.volume * 100)}`);
        
    } var player = message.guild.voiceConnection.player.dispatcher
        let volumeBefore = player.volume
        let volume = parseInt(suffix);
        
        if (volume > 100) return message.channel.send(":x:**The music can't be higher then 100**").then(response => { response.delete(5000) });
        player.setVolume((volume / 100));
         message.channel.send(":speaker: **Volume changed to** `"+ volume + "`");
        
    }


if (message.content.startsWith(prefix + 'resume')) {
  
        
        if (!message.member.voiceChannel) return message.channel.send('You need to be in a voice channel').then(response => { response.delete(5000) });
        let players = message.guild.voiceConnection.player.dispatcher
        if (!players) return message.channel.send('**:x: No music is playing at this time.**').then(response => { response.delete(5000) });
        if (players.playing) return message.channel.send('**:x: The music is already playing**').then(response => { response.delete(5000) });
        
        var queue = getQueue(message.guild.id);
   
        players.resume();
        
        message.channel.send(":arrow_forward: **Resuming music...**");
        
    } 


if (message.content.startsWith(prefix + 'queue')) {
  let queue = getQueue(message.guild.id);
    
    if (queue.length == 0) return message.channel.send(":x: **No music in queue**");
    let text = '';
    for (let i = 0; i < queue.length; i++) {
        text += `${(i + 1)}. ${queue[i].title} | Requested by ${queue[i].requested}\n`
    };
    message.channel.send(":globe_with_meridians: **Queue:**\n`" + text + "`");
    
}
} catch (err) {

console.log("Error\n\n\n" + err.stack)
errorlog[String(Object.keys(errorlog).length)] = {
    "code": err.code,
    "error": err,
    "stack": err.stack
}
fs.writeFile("./errors.json", JSON.stringify(errorlog), function(err) {
    if (err) return console.log("Error");
})
}

if (message.content.startsWith(prefix + "youtube-search")) {
var args = message.content.split(" ").slice(1).join(" ");
const searchvideo = require("request-promise-native");
if (!args) return message.channel.send("**:x: Error, please specify a title of video**");
searchvideo("https://www.googleapis.com/youtube/v3/search?q="+encodeURIComponent(args)+"&type=video&part=snippet&key=AIzaSyBfoLNsvoxoaGuEcfe9ZEmMniatbdTdAQk").then(objet => { 
let ytvideo = JSON.parse(objet);
if (ytvideo.pageInfo.totalResults === 0) return message.channel.send("**:x: I can't find this video**"); searchvideo("https://www.googleapis.com/youtube/v3/videos?id="+ytvideo.items[0].id.videoId+"&part=contentDetails&key=AIzaSyBfoLNsvoxoaGuEcfe9ZEmMniatbdTdAQk").then(info => { 
let videoInfo = JSON.parse(info);
var embed = new Discord.RichEmbed()
.setAuthor(ytvideo.items[0].snippet.channelTitle) 
.setTitle(ytvideo.items[0].snippet.title) 
.setURL("https://www.youtube.com/watch?v="+ytvideo.items[0].id.videoId)
.setColor(0xff0000) 
.setThumbnail("https://www.egedeniztextile.com/wp-content/uploads/2017/09/Youtube-logo-2017.png")  
.setDescription(ytvideo.items[0].snippet.description ? ytvideo.items[0].snippet.description : "null")
.addField("Duration", videoInfo.items[0].contentDetails.duration.toString().replace(/["PT", "S"]/g, "").replace("H", ":").replace("M", ":"), true)
.addField("URL", "https://www.youtube.com/watch?v="+ytvideo.items[0].id.videoId);
return message.channel.send(embed); }); });
}
});

}
