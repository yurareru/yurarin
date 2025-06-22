export default {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'ping') {
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })
      const latency = sent.createdTimestamp - interaction.createdTimestamp

      await interaction.editReply(`🏓 Pong! (${latency}ms)`)
    }
  }
}
