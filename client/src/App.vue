<script setup lang="ts">
import HanoiTowers from './components/hanoi-towers/HanoiTowers.vue';
</script>

<template>
  <header>
    <div class="wrapper">
      <h1 class="text-center">Towers of Hanoi.</h1>
    </div>
  </header>
  <main>
    <HanoiTowers></HanoiTowers>
  </main>
</template>

<style>
@import './assets/base.scss';

:root {
  --tower-element-height: 20px;
  --animation-speed: 0.5s;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}
</style>
