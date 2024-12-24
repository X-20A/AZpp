// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

const app_element = document.createElement('div');
app_element.id = 'app';
document.body.appendChild(app_element);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // PiniaをVueに登録
app.mount('#app');
