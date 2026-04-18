const mineflayer = require('mineflayer')

function createBot() {
  const bot = mineflayer.createBot({
    host: 'chickiennn.aternos.me', 
    port: 55125, 
    username: 'BotFarmQuai'
    
  })
  let started = false
  let isEating = false // Biến trạng thái để kiểm soát: Đang ăn thì không chém

  async function equipSword() {
    const sword = bot.inventory.items().find(item => item.name.includes('sword'))
    if (!sword) return
    const heldItem = bot.heldItem
    if (heldItem && heldItem.name.includes('sword')) return 

    try {
      await bot.equip(sword, 'hand')
      console.log(`⚔️ Đã cầm kiếm: ${sword.name}`)
    } catch (err) {}
  }

  bot.on('spawn', () => {
    console.log('✅ Bot đã sẵn sàng FARM!')
    equipSword()
  
  if (started) return   // 👈 thêm ở đây
    started = true  
      // Auto relog mỗi 10 phút
  setInterval(() => {
    console.log('♻️ Auto relog...')
    bot.quit()
  }, 600000)

    // 1. Chu kỳ chém quái
    setInterval(() => {
      if (isEating) return // NẾU ĐANG ĂN THÌ DỪNG QUÉT QUÁI HOÀN TOÀN

      const entity = bot.nearestEntity((e) => e.type === 'mob' || e.type === 'hostile')
      if (entity) {
        const distance = bot.entity.position.distanceTo(entity.position)
        if (distance < 4.5) {
          bot.lookAt(entity.position.offset(0, 1, 0), true)
          bot.attack(entity)
        }
      }
    }, 600)

    // 2. Chống AFK
    setInterval(() => {
      if (isEating) return
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 500)
    }, 15000)
  })

  // 3. Logic ĂN XONG MỚI CHÉM
  bot.on('health', async () => {
    // Nếu đói và chưa ở trạng thái đang ăn
    if (bot.food < 15 && !isEating) {
      const food = bot.inventory.items().find(item => item.name === 'golden_carrot')
      if (food) {
        isEating = true // KHÓA CHẾ ĐỘ CHÉM
        console.log('🥕 Đang đói, bắt đầu ăn...')
        
        try {
          await bot.equip(food, 'hand')
          await bot.consume() // Đợi ăn xong hoàn toàn (hàm này sẽ đợi thanh bù đói chạy xong)
          console.log('😋 Đã ăn xong. Đang chuẩn bị chiến đấu tiếp...')
          
          await equipSword() // Cầm lại kiếm
          
          // Đợi thêm 500ms để đảm bảo server cập nhật xong xuôi rồi mới mở khóa
          setTimeout(() => {
            isEating = false // MỞ KHÓA CHẾ ĐỘ CHÉM
          }, 500)
          
        } catch (err) {
          console.log('❌ Lỗi khi ăn, thử cầm lại kiếm...')
          await equipSword()
          isEating = false
        }
      }
    }
  })

  bot.on('playerCollect', () => {
    setTimeout(() => {
      const armorMap = { 'helmet': 'head', 'chestplate': 'torso', 'leggings': 'legs', 'boots': 'feet' }
      bot.inventory.items().forEach(item => {
        for (const [key, slot] of Object.entries(armorMap)) {
          if (item.name.includes(key)) bot.equip(item, slot).catch(() => {})
        }
      })
      if (!isEating) equipSword()
    }, 500)
  })

  bot.on('death', () => {
    isEating = false
    console.log('💀 Bot chết, đang hồi sinh...')
    bot.respawn()
  })

  bot.on('error', () => {
    setTimeout(createBot, 10000)
  })
  bot.on('end', () => {
  console.log('🔁 Reconnect sau 5s...')
  setTimeout(createBot, 5000)
})
}

createBot()
