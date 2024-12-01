
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { token, clientId } = require("./data/config.json");
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load information from the replies.json file
const replies = JSON.parse(fs.readFileSync("./data/replies.json", "utf8"));

// Slash commands to be registered and used
const commands = [
  { 
    name: "biography", 
    description: "Provides a brief biography of Steve Jobs." 
  },
  { 
    name: "quotes", 
    description: "Displays a random quote from Steve Jobs." 
  },
  { 
    name: "fact",
    description: "Provides a fun or lesser-known fact about Steve Jobs." 
  },
  { 
    name: "jobs-movies", 
    description: "Recommends movies or documentaries about Steve Jobs." 
  },
  { 
    name: "think-different", 
    description: 'The iconic "Think Different" campaign.' 
  },
  { 
    name: "devs-tips", 
    description: "Shares Steve Jobs' tips or advice for developers and creators." 
  }
];

// Function to register commands by making an API call, so that Discord recognizes it
const registerCommands = async () => {
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    // Register the commands with the application using the clientId
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
  } catch (error) {
    console.error("Error registering commands: ", error);
  }
};

// Event listener when a user interacts with the bot
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Helper function for random selection of any item in the array corresponding to the command type from the replies json file
  const getRandomItem = (repliesArray) => {
    const randomIndex = Math.floor(Math.random() * repliesArray.length);
    return repliesArray[randomIndex] || "Sorry! Couldn't find it for you...";
  };  

  // Map the commands to their respective replies and set a max value for the random selection
  const commandMap = {
    "biography": () => interaction.reply(replies.biography),
    
    "think-different": () => {
      const slogans = replies.campaign[0];  // Extract the list of desired information based on command type: same for all
      const randomSlogan = getRandomItem(Object.values(slogans));  // Randomly select an item: same for all
      interaction.reply(`**${randomSlogan}**`);
    },
    
    "quotes": () => {
      const quotes = replies.quotes[0];
      const randomQuote = getRandomItem(Object.values(quotes));
      interaction.reply(`*${randomQuote}*`);
    },
    
    "fact": () => {
      const facts = replies.facts[0];
      const randomFact = getRandomItem(Object.values(facts));
      interaction.reply(randomFact);
    },
    
    "jobs-movies": () => {
      const movies = replies.Movies[0];

      // Flatten the movie replies from nested arrays before since it is a more complicated object
      const allMovies = Object.values(movies).flat();
      const randomMovie = getRandomItem(allMovies);
      interaction.reply(`**Name:** ${randomMovie.name}\n**Genre:** ${randomMovie.genre}\n**Released in:** ${randomMovie.release_year}\n**Director:** ${randomMovie.director}\n**Runtime:** ${randomMovie.runtime}\n**Synopsis:** ${randomMovie.synopsis}`);
    },
    
    "devs-tips": () => {
      const tips = replies.devTips[0];
      const randomTip = getRandomItem(Object.values(tips));
      interaction.reply(`*${randomTip}*`);
    }
  };
  
  // Check if the command exists in the map, and execute it
  if (commandMap[commandName]) {
    commandMap[commandName]();
  }
});

// Event listener triggered once the bot has successfully logged in
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Set the bot's avatar to an image stored locally
  const image = fs.readFileSync('./data/steveBotPFP.jpg');
  client.user.setAvatar(image)

  // Register the slash commands with Discord
  registerCommands();
});

// Log in the bot with the token from the config file
client.login(token);
