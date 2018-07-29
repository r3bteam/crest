const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const { Client, Util } = require('discord.js');

const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config');

const YouTube = require('simple-youtube-api');

const ytdl = require('ytdl-core');

var guilds = {};

const client = new Client({ disableEveryone: true });



const youtube = new YouTube(GOOGLE_API_KEY);



const queue = new Map();



client.on('warn', console.warn);



client.on('error', console.error);



client.on('ready', () => console.log('Yo this ready!'));



client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));



client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));
client.on('ready', async () => {
    console.log('I am ready!');

    client.user.setPresence({ game: { name: 'Only Moha', type: 2 } });
});

client.on('msg', async msg => { // eslint-disable-line
    if (msg.author.bot) return undefined;
    

    if (!guilds[msg.guild.id]) {
        guilds[msg.guild.id] = {
            voiceChannel: null,
            loop: false
        };
    }

    function clear() { 
        guilds[msg.guild.id].loop = false;
        guilds[msg.guild.id].volume = 1 ;
    }


	var embed = new Discord.RichEmbed()
	if (!msg.content.startsWith(PREFIX)) return undefined;


	const args = msg.content.split(' ');

	const searchString = args.slice(1).join(' ');

	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';

	const serverQueue = queue.get(msg.guild.id);



	let command = msg.content.toLowerCase().split(" ")[0];

	command = command.slice(PREFIX.length)

	if (command === `play`) {
    
		const voiceChannel = msg.member.voiceChannel;
        
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');

		const permissions = voiceChannel.permissionsFor(msg.client.user);

		if (!permissions.has('CONNECT')) {

			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');

		}

		if (!permissions.has('SPEAK')) {

			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');

		}



		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);

			const videos = await playlist.getVideos();

			for (const video of Object.values(videos)) {

				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop

				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop

			}

			return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);

		} else {

			try {

				var video = await youtube.getVideo(url);

			} catch (error) {

				try {

					var videos = await youtube.searchVideos(searchString, 10);

					let index = 0;

					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**اختار رقم المقطع** :
${videos.map(video2 => `[**${++index} **] \`${video2.title}\``).join('\n')}`)
					.setFooter("")
					msg.channel.sendEmbed(embed1).then(msg =>{msg.delete(20000)})
					// eslint-disable-next-line max-depth


					// eslint-disable-next-line max-depth

					try {

						var response = await msg.channel.awaitmsgs(msg2 => msg2.content > 0 && msg2.content < 11, {

							maxMatches: 1,

							time: 10000,

							errors: ['time']

						});

					} catch (err) {

						console.error(err);

						return msg.channel.send('No or invalid value entered, cancelling video selection.');

					}

					const videoIndex = parseInt(response.first().content);

					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);

				} catch (err) {

					console.error(err);

					return msg.channel.send('🆘 I could not obtain any search results.');

				}

			}

			return handleVideo(video, msg, voiceChannel);

		}
    
	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');

		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');

		serverQueue.connection.dispatcher.end('Skip command has been used!');

		return undefined;

	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');

		if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');

		serverQueue.songs = [];

		serverQueue.connection.dispatcher.end('Stop command has been used!');

		return undefined;



	} else if (command === `vol`) {

		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');

		if (!serverQueue) return msg.channel.send('There is nothing playing.');

        if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);

        if (args > 200) return msg.reply('**:headphones: For some health reasons the max vol you can use is ``200``, kthx**');
        if (args < 1) return msg.reply("**:headphones: you can set volume from ``1`` to ``200``**");

		serverQueue.volume = args[1];

		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);

		return msg.channel.send(`I set the volume to: **${args[1]}**`);

	} else if (command === `np`) {

		if (!serverQueue) return msg.channel.send('There is nothing playing.');

		return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);

	} else if (command === `queue`) {

		if (!serverQueue) return msg.channel.send('There is nothing playing.');

		return msg.channel.send(`

__**Song queue:**__



${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}



**Now playing:** ${serverQueue.songs[0].title}

		`);

	} else if (command === `pause`) {

		if (serverQueue && serverQueue.playing) {

			serverQueue.playing = false;

			serverQueue.connection.dispatcher.pause();

			return msg.channel.send('⏸ Paused the music for you!');

		}

		return msg.channel.send('There is nothing playing.');

	} else if (command === `resume`) {

		if (serverQueue && !serverQueue.playing) {

			serverQueue.playing = true;

			serverQueue.connection.dispatcher.resume();

			return msg.channel.send('▶ Resumed the music for you!');

		}

		return msg.channel.send('There is nothing playing.');

	}

else if (command === `loop`) {
    if (!msg.member.voiceChannel) return;
    if (!guilds[msg.guild.id].isPlaying) return msg.channel.send("**:x: Nothing playing in this server**")
    if(guilds[msg.guild.id].loop === true) {
        msg.channel.send(`:arrow_right_hook: **Looping Disabled**`)
        guilds[msg.guild.id].loop = false;        
        return;
    } else if(guilds[msg.guild.id].loop === false) {
    guilds[msg.guild.id].loop = true;
    msg.channel.send(':repeat_one: **Looping Enabled!**')
    return;
    }
}

else if (command === `join`) {
    if (!msg.member.voiceChannel) return;
    if(!guilds[msg.guild.id].isPlaying && guilds[msg.guild.id].queueNames.length <= 0) {
        msg.member.voiceChannel.join().then(msg.react(correct));
        msg.channel.send(`**:page_facing_up: Queue moved to \`\`${msg.member.voiceChannel.name}\`\`**`)
    } else {
        msg.channel.send(`<:MxNo:460268184218632222> **Music is being played in another voice channel!**`)
    }
}
	return undefined;

});


async function handleVideo(video, msg, voiceChannel, playlist = false) {

	const serverQueue = queue.get(msg.guild.id);

	console.log(video);

	const song = {

		id: video.id,

		title: Util.escapeMarkdown(video.title),

		url: `https://www.youtube.com/watch?v=${video.id}`

	};

	if (!serverQueue) {

		const queueConstruct = {

			textChannel: msg.channel,

			voiceChannel: voiceChannel,

			connection: null,

			songs: [],

			volume: 5,

			playing: true

		};

		queue.set(msg.guild.id, queueConstruct);



		queueConstruct.songs.push(song);



		try {

			var connection = await voiceChannel.join();

			queueConstruct.connection = connection;

			play(msg.guild, queueConstruct.songs[0]);

		} catch (error) {

			console.error(`I could not join the voice channel: ${error}`);

			queue.delete(msg.guild.id);

			return msg.channel.send(`I could not join the voice channel: ${error}`);

		}

	} else {

		serverQueue.songs.push(song);

		console.log(serverQueue.songs);

		if (playlist) return undefined;

		else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);

	}

	return undefined;

}



function play(guild, song) {

	const serverQueue = queue.get(guild.id);



	if (!song) {

		serverQueue.voiceChannel.leave();

		queue.delete(guild.id);

		return;

	}

	console.log(serverQueue.songs);



	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))

		.on('end', reason => {

			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');

			else console.log(reason);

			serverQueue.songs.shift();

			play(guild, serverQueue.songs[0]);

		})

		.on('error', error => console.error(error));

	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);



	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);

}




const devs = ["402043862480322562" , "443696811421466624"]

const adminprefix = "M";
client.on('msg', msg => {
    var argresult = msg.content.split(` `).slice(1).join(' ');
      if (!devs.includes(msg.author.id)) return;
      
  if (msg.content.startsWith(adminprefix + 'ply')) {
    client.user.setGame(argresult);
      msg.channel.sendmsg(`**:white_check_mark:   ${argresult}**`)
  } else 
    if (msg.content === (adminprefix + "Percie")) {
    msg.guild.leave();        
  } else  
  if (msg.content.startsWith(adminprefix + 'wt')) {
  client.user.setActivity(argresult, {type:'WATCHING'});
      msg.channel.sendmsg(`**:white_check_mark:   ${argresult}**`)
  } else 
  if (msg.content.startsWith(adminprefix + 'ls')) {
  client.user.setActivity(argresult , {type:'LISTENING'});
      msg.channel.sendmsg(`**:white_check_mark:   ${argresult}**`)
  } else     
    if (msg.content.startsWith(adminprefix + 'setname')) {
  client.user.setUsername(argresult).then
      msg.channel.sendmsg(`**${argresult}** : Done :>`)
  return msg.reply("**You Can't Change Your Name ,Only After Two Hours :>**");
  } else
    if (msg.content.startsWith(adminprefix + 'setavatar')) {
  client.user.setAvatar(argresult);
    msg.channel.sendmsg(`**${argresult}** : تم تغير صورة البوت`);
        } else     
  if (msg.content.startsWith(adminprefix + 'st')) {
    client.user.setGame(argresult, "https://www.twitch.tv/idk");
      msg.channel.sendmsg(`**:white_check_mark:   ${argresult}**`)
  }
    if(msg.content === adminprefix + "restart") {
      if (!devs.includes(msg.author.id)) return;
          msg.channel.send(`:warning:️ **Bot restarting by ${msg.author.username}**`);
        console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(`⚠️ Bot restarting... ⚠️`);
        console.log("===============================================\n\n");
        client.destroy();
        child_process.fork(__dirname + "/bot.js");
        console.log(`Bot Successfully Restarted`);
    }
  
  });


client.on('msg', msg => {

    if (msg.content == 'Mjoin') {
        if (msg.member.voiceChannel) {

     if (msg.member.voiceChannel.joinable) {
         msg.member.voiceChannel.join();
     }
    }
}
})



client.login(process.env.BOT_TOKEN);
