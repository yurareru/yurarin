export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return
    if (message.content === 'tes') {
      message.reply('tis')
    }
  }
}
