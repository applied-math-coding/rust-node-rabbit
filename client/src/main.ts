import { createApp } from 'vue'
import App from './App.vue'
import 'primeflex/primeflex.css';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

createApp(App)
    .use(createPinia())
    .use(PrimeVue)
    .mount('#app')
