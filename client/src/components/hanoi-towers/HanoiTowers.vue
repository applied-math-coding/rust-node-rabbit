<script setup lang="ts">
import { reactive } from 'vue';
import Tower from './tower/Tower.vue';

const state = reactive({ n: 5 });
</script>

<template>
    <div class="towers">
        <div class="tower-positioner" v-for="id in [0, 1, 2]">
            <Tower :tower-id="id" :number-elements="id === 0 ? state.n : 0"></Tower>
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