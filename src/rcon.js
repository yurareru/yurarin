import { Rcon } from 'rcon-client'

let rcon

export async function connectRCON() {
  try {
    rcon = new Rcon({
      host: process.env.RCON_HOST,
      port: process.env.RCON_PORT,
      password: process.env.RCON_PASSWORD
    })
    await rcon.connect()
    console.log('[RCON] Connected.')

  } catch (error) {
    console.error('[RCON] failed to connect:', error)
  }
}

export async function sendRCON(command) {
  if (!rcon) return console.warn('[RCON] Not connected.')
  try {
    await rcon.send(command)
  } catch (error) {
    console.error('[RCON] failed to send command:', error)
  }
}
