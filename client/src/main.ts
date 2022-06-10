import { createApp } from 'vue'
import App from './App.vue'
import 'primeflex/primeflex.css';
import { createPinia } from 'pinia'

createApp(App)
    .use(createPinia())
    .mount('#app')
