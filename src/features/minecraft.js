import chokidar from 'chokidar'
import fs from 'node:fs'
import fsPromise from 'node:fs/promises'
import { sendRCON } from '../rcon.js'

export async function sendToMinecraft(message) {
  if (message.channelId !== process.env.MC_CHANNEL_ID) return
  const displayName = message.member?.nickname || message.author.displayName
  const text = message.content.replace(/"/g, '\\"')
  const attachment = message.attachments.first()
  const attachmentUrl = attachment?.url ?? null
  const components = [
    { 
      text: '[Discord]',
      color: '#5865f2',
      bold: true,
    },
    { 
      text: ` <${displayName}> ${text}`,
      color: 'white',
      bold: false,
      hover_event: {
        action: 'show_text',
        value: 'Mention user'
      },
      click_event: {
        action: 'suggest_command',
        command: `<@${message.author.id}> `
      },
    },
  ]

  if (attachmentUrl) {
    components.push({
      text: '\n' + attachment.name,
      color: 'blue',
      bold: false,
      italic: true,
      hover_event: {
        action: 'show_text',
        value: 'Open attachment'
      },
      click_event: {
        action: 'open_url',
        url: attachmentUrl
      },
    })
  }

  await sendRCON(`tellraw @a ${JSON.stringify(components)}`)
}

const offsetFile = './latest.log.offset.json'

async function loadOffset(logPath) {
  try {
    const data = await fsPromise.readFile(offsetFile, 'utf8')
    const map = JSON.parse(data)
    return map[logPath] ?? 0
  } catch {
    return 0
  }
}

async function saveOffset(logPath, offset) {
  let map = {}
  try {
    const data = await fsPromise.readFile(offsetFile, 'utf8')
    map = JSON.parse(data)
  } catch {}
  map[logPath] = offset
  await fsPromise.writeFile(offsetFile, JSON.stringify(map, null, 2))
}

export async function watchMinecraftLog(logPath, channel) {
  let lastSize = await loadOffset(logPath)

  chokidar.watch(logPath, {
    usePolling: true,
    interval: 500,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  }).on('change', (filePath) => {
      fs.stat(filePath, (err, stats) => {
        if (err) return

        const newSize = stats.size
        if (newSize < lastSize) lastSize = 0

        const stream = fs.createReadStream(filePath, {
          start: lastSize,
          end: newSize,
          encoding: 'utf8'
        })

        let buffer = ''
        stream.on('data', (chunk) => (buffer += chunk))
        stream.on('end', async () => {
          lastSize = newSize
          await saveOffset(logPath, lastSize)

          const lines = buffer.split('\n')

          for (const line of lines) {
            if (!line.trim()) continue

            const chatMatch = line.match(/<([^>]+)> (.+)/)
            if (chatMatch) {
              const [, user, content] = chatMatch
              channel.send(`\`<${user}>\` ${content}`)
              continue
            }

            const joinMatch = line.match(/: (\w+) joined the game/)
            if (joinMatch) {
              const [, user] = joinMatch
              channel.send(`\`${user}\` joined the game`)
              continue
            }

            const leaveMatch = line.match(/: (\w+) left the game/)
            if (leaveMatch) {
              const [, user] = leaveMatch
              channel.send(`\`${user}\` left the game`)
              continue
            }

            const advMatch = line.match(/: (\w+) has made the advancement \[(.+?)\]/)
            if (advMatch) {
              const [, user, adv] = advMatch
              channel.send(`\`${user}\` has made the advancement **[${adv}]**`)
              continue
            }

            const deathMatch = line.match(/: ([\w\d_]+) (was .*|fell .*|drowned.*|died.*|blew up.*|hit the ground too hard.*|tried .*|was shot.*|was slain.*)/)
            if (deathMatch) {
              const [, user, reason] = deathMatch
              channel.send(`\`${user}\` ${reason}`)
              continue
            }
          }
        })
      })
    })
}
