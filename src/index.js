import { Client, IntentsBitField } from 'discord.js'
import 'dotenv/config'
import chalk from 'chalk'

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent
  ]
})

const platformIcons = {
  web: '🌐',
  mobile: '📱',
  desktop: '💻'
}

const statusColors = {
  online: chalk.green,
  idle: chalk.yellow,
  dnd: chalk.red,
  offline: chalk.gray
}

client.once('ready', (c) => {
  console.log(chalk.bgGreen.black(` Bot is online. `))
  const guild = client.guilds.cache.get(process.env.GUILD_TARGET)

  let lastLog = ''

  setInterval(async () => {
    const member = await guild.members.fetch(process.env.MEMBER_TARGET)
    const presence = member.presence
    const clientStatus = presence?.clientStatus ?? {}
    const activities = presence?.activities ?? []

    const activityDetails = activities.map((act) => {
      switch (act.type) {
        case 0: return chalk.blackBright(`🎮 Playing ${act.name}`)
        case 1: return `📺 Streaming ${act.name}`
        case 2: return `🎧 Listening to ${act.name}`
        case 3: return `👀 Watching ${act.name}`
        case 4: return `💬 ${act.state || 'Custom Status'}`
        case 5: return `🏆 Competing in ${act.name}`
        default: return '❓ Unknown Activity'
      }
    }).join(' | ') || 'No activity'

    const platformStatus = Object.entries(clientStatus)
    .map(([platform, status]) => `${platformIcons[platform] ?? platform}: ${statusColors[status](status)}`)
    .join(' | ') || chalk.dim('Offline')

    const fullLog = `${activityDetails} | ${platformStatus}`
    if (fullLog !== lastLog) {
      console.log(`[${chalk.gray(new Date().toLocaleTimeString())}] ${activityDetails} | ${platformStatus}`)
      lastLog = fullLog
    }
  }, 1e3)
})

client.on('messageCreate', (message) => {
  if (message.author.bot) return
  if (message.content === 'hai') {
    message.reply(`Halo ${message.author.username}`)
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })
    const latency = sent.createdTimestamp - interaction.createdTimestamp

    await interaction.editReply(`🏓 Pong! (${latency}ms)`)
  }
})

client.login(process.env.TOKEN)
