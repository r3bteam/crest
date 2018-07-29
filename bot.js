const Discord = require("discord.js");
var jimp = require("jimp");
const client = new Discord.Client();
  

const music = require("./music.js").run(client);

  client.on('ready', () => {
  console.log("Bot Faelwen \nON");
client.user.setGame(`Only Moha`, "https://twitch.tv/Moha")
  });




client.login(process.env.BOT_TOKEN);
