import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Cash Buddy is 100% offline ready!')
  }
})

createApp(App).mount('#app')
