import { exec } from 'child_process'
import path from 'node:path'
import os from 'node:os'
import { EmbedBuilder } from 'discord.js'

let currentDir = os.homedir()

export async function shell(message) {
  if (!message.content.startsWith('$')) return

  const command = message.content.slice(1).trim()
  const [cmd, ...args] = command.split(/\s+/)

  if (!command) {
    return message.reply('❌ No command provided.')
  }

  if (message.author.id != process.env.OWNER_ID) {
    return message.reply('❌ Unprivileged access.')
  }

  if (cmd === 'cd') {
    const target = args.join(' ') || os.homedir()
    const newPath = path.resolve(currentDir, target)

    try {
      process.chdir(newPath)
      currentDir = newPath
      return message.reply(`📁 Directory changed to:\n\`${currentDir}\``)
    } catch {
      return message.reply(`❌ Failed to change directory to \`${target}\``)
    }
  }

  exec(command, { shell: 'powershell', cwd: currentDir } , (error, stdout, stderr) => { // powershell for now
    const output = error ? stderr || error.message : stdout || '✅ Done!'
    const embed = new EmbedBuilder()
    .setColor(error ? 0xff0000 : 0x00ff99)
    .setTitle(`📟 Command: \`${command}\``)
    .setDescription(`\`\`\`ps1\n${output.slice(0, 4000)}\n\`\`\``)
    .setFooter({ text: currentDir })

    message.reply({ embeds: [embed] })
  })
}
