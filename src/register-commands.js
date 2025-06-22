import { REST, Routes } from 'discord.js'
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'url'

const clientId = process.env.CLIENT_ID
const guildIds = process.env.GUILD_IDS.split(',')

const commands = []
const commandFiles = await fs.readdir('./src/commands')

for (const file of commandFiles) {
  const command = (await import(pathToFileURL(path.resolve('./src/commands', file)).href)).default
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON())
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)

for (const guildId of guildIds) {
  try {
    console.log(`🔁 Registering commands for guild ${guildId}`)
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    )
    console.log(`✅ Commands registered for guild ${guildId}`)
  } catch (error) {
    console.error(`❌ Failed to register commands for ${guildId}`, error)
  }
}

