import Vue from 'vue';
import App from '../app.vue';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.body.appendChild(document.createElement('hello'));
  app = new Vue({
    el,
    render: h => h(App)
  });
  console.log(1 + 1);
});

console.log("updated!");