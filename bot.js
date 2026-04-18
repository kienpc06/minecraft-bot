const mineflayer = require('mineflayer')

function createBot() {
  const bot = mineflayer.createBot({
    host: 'chickiennn.aternos.me',
    port: 55125,
    username: 'AFK_Bot'
  })

  bot.on('spawn', () => {
    console.log('✅ Bot online 24/7')

    setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 500)
    }, 10000)
  })

  bot.on('end', () => {
    console.log('🔁 reconnect sau 5s...')
    setTimeout(createBot, 5000)
  })

  bot.on('error', err => console.log('❌', err))
}

createBot()