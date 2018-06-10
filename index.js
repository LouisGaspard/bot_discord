const Discord = require('discord.js')
const https = require('https');
const bot = new Discord.Client()
const fortnite = require('fortnitetracker-7days-stats');

const fs = require('fs');
let id_ftn = JSON.parse(fs.readFileSync("./id_ftn.json", "utf8"));

bot.on('ready', function () {
	bot.user.setActivity("!ftn ou !ftn7");
	console.log("Je suis connecté !")
});

bot.config = {
	PREFIX: "!",
	TRN_APIKEY: "FORTNITE TRACKER API KEY"
};

bot.on("message", msg => {
	if (msg.author.bot) return;

	var u = msg.author.username;
	var c = msg.channel.name;
	if (c == undefined) c = "private";

	var m = msg.content;
	if (!m.startsWith(bot.config.PREFIX)) return;

	console.log("[" + c + "] " + u + ": " + m);

	var args = m.substring(bot.config.PREFIX.length).split(" ");
	var cmdName = args[0].toLowerCase();

	if (cmdName === "help") {
		var help = fs.readFileSync('./commands.txt', 'utf8');
		msg.channel.send(help);
	}

	if (cmdName === "ftn") {
		if (!args[1]) {
			if (!id_ftn[msg.author.id])
				return msg.channel.send("!ftn link <pseudo>");
			if (id_ftn[msg.author.id].pseudo_ftn == null)
				return msg.channel.send("!ftn link <pseudo>");
			let user_id = id_ftn[msg.author.id];
			var name = user_id.pseudo_ftn;
			var options = {
				host: 'api.fortnitetracker.com',
				path: '/v1/profile/pc/' + encodeURIComponent(name),
				port: 443,  // isnt this used for mail?
				method: 'GET',
				headers: { 'TRN-Api-Key': bot.config.TRN_APIKEY }
			};
			var req = https.request(options, function(res){
			var body = "";
			res.on('data', function(data){
				body += data;
				});
				res.on('end', end => {
	        			body = JSON.parse(body);
					console.log(body);
					if(body.error) {
						msg.channel.send(`Player not found`);
						return;
					}
					msg.channel.startTyping();
					var epicName = body["epicUserHandle"];
					var url = "https://fortnitetracker.com/profile/pc/"
								+ encodeURIComponent(name);
					var gen_stats = "";
					gen_stats += "Matches: " + body.lifeTimeStats[7]["value"];
					gen_stats += "\tWins: " + body.lifeTimeStats[8]["value"];
					gen_stats += "\tWinrate: " + body.lifeTimeStats[9]["value"];
					gen_stats += "\tKills: " + body.lifeTimeStats[10]["value"];
					gen_stats += "\tRatio: " + body.lifeTimeStats[11]["value"];
					var solo_stats = "";
					if (!body.stats.p2)
						solo_stats += "No Solo";
					else {
						solo_stats += "Wins: " + body.stats.p2.top1["value"];
						solo_stats += "\tMatches: " + body.stats.p2.matches["value"];
						solo_stats += "\tWinrate: " + body.stats.p2.winRatio["value"];
						solo_stats += "%\tKills: " + body.stats.p2.kills["value"];
						solo_stats += "\tRatio: " + body.stats.p2.kd["value"];
					}
					var duo_stats = "";
					if (!body.stats.p10)
						duo_stats += "No Duo";
					else {
						duo_stats += "Wins: " + body.stats.p10.top1["value"];
						duo_stats += "\tMatches: " + body.stats.p10.matches["value"];
						duo_stats += "\tWinrate: " + body.stats.p10.winRatio["value"];
						duo_stats += "%\tKills: " + body.stats.p10.kills["value"];
						duo_stats += "\tRatio: " + body.stats.p10.kd["value"];
					}
					var squad_stats = "";
					if (!body.stats.p9)
						squad_stats += "No Squad";
					else {
						squad_stats += "Wins: " + body.stats.p9.top1["value"];
						squad_stats += "\tMatches: " + body.stats.p9.matches["value"];
						squad_stats += "\tWinrate: " + body.stats.p9.winRatio["value"];
						squad_stats += "%\tKills: " + body.stats.p9.kills["value"];
						squad_stats += "\tRatio: " + body.stats.p9.kd["value"];
					}
					var embed = new Discord.RichEmbed()
						.setAuthor(epicName, "", url)
						.setColor(9955331)
						.setURL(url)
						.setThumbnail("https://cdn2.unrealengine.com/Fortnite%2Fhome%2Ffn_battle_logo-1159x974-8edd8b02d505b78febe3baacec47a83c2d5215ce.png")
						.addField("General", gen_stats)
						.addBlankField(true)
						.addField("Solo", solo_stats)
						.addField("Duo", duo_stats)
						.addField("Squad", squad_stats);
					msg.channel.stopTyping();
					msg.channel.send(embed);
				});
			});
			req.end();
			return;
		}
		if (args[1].toLowerCase() === "link") {
			var name = "";
			for(var i = 2; i < args.length; i++){
				name += args[i] + " ";
			}
			name = name.trim();
			if (!id_ftn[msg.author.id] || id_ftn[msg.author.id].pseudo_ftn == null) id_ftn[msg.author.id] = {
				pseudo_ftn: name
			};
			fs.writeFile("./id_ftn.json", JSON.stringify(id_ftn), (err) => {
			if (err)
				console.error(err)
			});
			msg.channel.send("Linked to " + name);
			return;
		}
		if (args[1].toLowerCase() === "unlink") {
			if (id_ftn[msg.author.id]) id_ftn[msg.author.id] = {
				pseudo_ftn: null
			};
			msg.channel.send("Unlinked");
			return;
		}
		if (!args[1]) return msg.channel.send('**Pense à mettre ton pseudo: `!ftn <pseudo>`**');
		if (['pc', 'xbl', 'psn'].includes(args[1])) return msg.channel.send('**Pas besoin de mettre ta platform: `!ftn <pseudo>`**');
		var name = "";
		for(var i = 1; i < args.length; i++){
			name += args[i] + " ";
		}
		name = name.trim();
		var options = {
			host: 'api.fortnitetracker.com',
			path: '/v1/profile/pc/' + encodeURIComponent(name),
			port: 443,  // isnt this used for mail?
			method: 'GET',
			headers: { 'TRN-Api-Key': bot.config.TRN_APIKEY }
		};
		var req = https.request(options, function(res){
			var body = "";
			res.on('data', function(data){
				body += data;
			});
			res.on('end', end => {
	        		body = JSON.parse(body);
				console.log(body);
				if(body.error){
	        			msg.channel.send(`Player not found`);
	        			return;
	        		}
				msg.channel.startTyping();
	        		var epicName = body["epicUserHandle"];
        			var url = "https://fortnitetracker.com/profile/pc/"
							+ encodeURIComponent(name);
				var gen_stats = "";
				gen_stats += "Matches: " + body.lifeTimeStats[7]["value"];
				gen_stats += "\tWins: " + body.lifeTimeStats[8]["value"];
				gen_stats += "\tWinrate: " + body.lifeTimeStats[9]["value"];
				gen_stats += "\tKills: " + body.lifeTimeStats[10]["value"];
				gen_stats += "\tRatio: " + body.lifeTimeStats[11]["value"];
				var solo_stats = "";
				if (!body.stats.p2)
					solo_stats += "No Solo";
				else {
					solo_stats += "Wins: " + body.stats.p2.top1["value"];
					solo_stats += "\tMatches: " + body.stats.p2.matches["value"];
					solo_stats += "\tWinrate: " + body.stats.p2.winRatio["value"];
					solo_stats += "%\tKills: " + body.stats.p2.kills["value"];
					solo_stats += "\tRatio: " + body.stats.p2.kd["value"];
				}
				var duo_stats = "";
				if (!body.stats.p10)
					duo_stats += "No Duo";
				else {
					duo_stats += "Wins: " + body.stats.p10.top1["value"];
					duo_stats += "\tMatches: " + body.stats.p10.matches["value"];
					duo_stats += "\tWinrate: " + body.stats.p10.winRatio["value"];
					duo_stats += "%\tKills: " + body.stats.p10.kills["value"];
					duo_stats += "\tRatio: " + body.stats.p10.kd["value"];
				}
				var squad_stats = "";
				if (!body.stats.p9)
					squad_stats += "No Squad";
				else {
					squad_stats += "Wins: " + body.stats.p9.top1["value"];
					squad_stats += "\tMatches: " + body.stats.p9.matches["value"];
					squad_stats += "\tWinrate: " + body.stats.p9.winRatio["value"];
					squad_stats += "%\tKills: " + body.stats.p9.kills["value"];
					squad_stats += "\tRatio: " + body.stats.p9.kd["value"];
				}
				var embed = new Discord.RichEmbed()
	                		.setAuthor(epicName, "", url)
       	         			.setColor(9955331)
       	        	 		.setURL(url)
       		         		.setThumbnail("https://cdn2.unrealengine.com/Fortnite%2Fhome%2Ffn_battle_logo-1159x974-8edd8b02d505b78febe3baacec47a83c2d5215ce.png")
					.addField("General", gen_stats)
					.addBlankField(true)
					.addField("Solo", solo_stats)
					.addField("Duo", duo_stats)
					.addField("Squad", squad_stats);
				msg.channel.stopTyping();
				msg.channel.send(embed);
			});
		});
		req.end();
	}

	if (cmdName === "ftn7") {
		if (!args[1]) {
			if (!id_ftn[msg.author.id])
				return msg.channel.send("!ftn7 link <pseudo>");
			if (id_ftn[msg.author.id].pseudo_ftn == null)
				return msg.channel.send("!ftn7 link <pseudo>");
			let user_id = id_ftn[msg.author.id];
			var name = user_id.pseudo_ftn;
			var url = "https://fortnitetracker.com/profile/pc/"
					+ encodeURIComponent(name);
			msg.channel.startTyping();
			fortnite.getStats(name, "pc", (err, result) => {
				if(err){
					msg.channel.send("<:warning:410852302698708993> Player not found");
					msg.channel.stopTyping();
					return;
				}
				var mssg = "";
				mssg += "Wins: " + result.wins;
				mssg += "\tMatches: " + result.matches;
				mssg += "\tWinrate: " + ~~result.wr + "%";   // ~~ = absolute value
				mssg += "\tKills: " + result.kills;
				mssg += "\tRatio: " + result.kd;
				var embed = new Discord.RichEmbed()
					.setAuthor(result.accountName, "", url)
					.setDescription("Stats 7 last days")
					.setColor(9955331)
					.setURL(url)
					.setThumbnail(result.skinUrl)
					.addField("Stats", mssg);
				msg.channel.stopTyping();
				msg.channel.send(embed);
			});
			return;
		}
		if (args[1].toLowerCase() === "link") {
			var name = "";
			for(var i = 2; i < args.length; i++){
				name += args[i] + " ";
			}
			name = name.trim();
			if (!id_ftn[msg.author.id] || id_ftn[msg.author.id].pseudo_ftn == null) id_ftn[msg.author.id] = {
				pseudo_ftn: name
			};
			fs.writeFile("./id_ftn.json", JSON.stringify(id_ftn), (err) => {
			if (err)
				console.error(err)
			});
			msg.channel.send("Linked to " + name);
			return;
		}
		if (args[1].toLowerCase() === "unlink") {
			if (id_ftn[msg.author.id]) id_ftn[msg.author.id] = {
				pseudo_ftn: null
			};
			msg.channel.send("Unlinked");
			return;
		}
		var platform = "";
		if (!args[1]) return msg.channel.send('**Pense à mettre ton pseudo: `!ftn <pseudo>`**');
		if (['pc', 'xbl', 'psn'].includes(args[1])) return msg.channel.send('**Pas besoin de  mettre ta platform: `!ftn <pseudo>`**');
		var name = "";
		for(var i = 1; i < args.length; i++){
			name += args[i] + " ";
		}
		name = name.trim();
		var url = "https://fortnitetracker.com/profile/pc/"
					+ encodeURIComponent(name);
		msg.channel.startTyping();
		fortnite.getStats(name, "pc", (err, result) => {
			if(err){
				msg.channel.send("<:warning:410852302698708993> Player not found");
				msg.channel.stopTyping();
				return;
	        	}
			var mssg = "";
			mssg += "Wins: " + result.wins;
			mssg += "\tMatches: " + result.matches;
			mssg += "\tWinrate: " + ~~result.wr + "%";   // ~~ = absolute value
			mssg += "\tKills: " + result.kills;
			mssg += "\tRatio: " + result.kd;
			var embed = new Discord.RichEmbed()
				.setAuthor(result.accountName, "", url)
				.setDescription("Stats 7 last days")
				.setColor(9955331)
				.setURL(url)
				.setThumbnail(result.skinUrl)
				.addField("Stats", mssg);
			msg.channel.stopTyping();
			msg.channel.send(embed);
		});
	}
})

bot.login('BOT DISCORD TOKEN')
