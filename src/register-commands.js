import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import 'dotenv/config'

const clientId = process.env.CLIENT_ID
const guildIds = process.env.GUILD_IDS.split(',')

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    for (const guildId of guildIds) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      )
    }
  } catch (error) {
    console.error(error)
  }
})
