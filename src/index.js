import { Client, Collection, IntentsBitField } from 'discord.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'url'
import 'dotenv/config'

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent
  ]
})

client.commands = new Collection()

const commandFiles = await fs.readdir('./src/commands')
for (const file of commandFiles) {
  const command = (await import(pathToFileURL(path.resolve('./src/commands', file)).href)).default
  client.commands.set(command.data.name, command)
}

const eventFiles = await fs.readdir('./src/events')
for (const file of eventFiles) {
  const event = (await import(pathToFileURL(path.resolve('./src/events', file)).href)).default

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.BOT_TOKEN)
