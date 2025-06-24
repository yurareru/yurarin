import { sendToMinecraft } from '../features/minecraft.js'
import { shell } from '../features/shell.js'

export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return

    if (message.content === 'tes') {
      return message.reply('tis')
    } 

    await sendToMinecraft(message)
    await shell(message)
  }
}
