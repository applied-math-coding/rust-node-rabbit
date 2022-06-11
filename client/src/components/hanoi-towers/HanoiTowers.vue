<script setup lang="ts">
import { useStore } from '@/store';
import { computed, reactive } from 'vue';
import Tower from './tower/Tower.vue';

const store = useStore();
const state = reactive({ n: 5 });
const towerHeight = computed(() => `calc(var(--tower-element-height) * ${state.n})`);

setTimeout(async () => {
    let e = await store.removeFrom(0);
    await store.pushTo(1, e);
    e = await store.removeFrom(0);
    await store.pushTo(1, e);
}, 1000) //TODO list to start button
// offer stop button
// during play disable start
// fetch solution from server

</script>

<template>
    <div class="towers">
        <div class="tower-positioner" v-for="id in [0, 1, 2]">
            <Tower :tower-id="id" :height="towerHeight"></Tower>
        </div>
    </div>
</template>

<style scoped lang="scss">
.towers {
    display: flex;
    gap: 15px;

    .tower-positioner {
        flex: 1 0;
    }
}
</style>