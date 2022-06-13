<script setup lang="ts">
import { useStore } from '@/store';
import { computed, reactive } from 'vue';
import Tower from './tower/Tower.vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';

const store = useStore();
const towerHeight = computed(() => `calc(var(--tower-element-height) * ${store.elementCount})`);
const state = reactive({
    playing: false,
    loading: false
});

async function handlePlay() {
    state.playing = true;
    state.loading = true;
    const steps = await fetchHanoiSteps(store.elementCount);
    state.loading = false;
    await applySteps(steps);
    state.playing = false;
}

function handleStop() {
    store.stop();
}

function handleCountChange({ value }: any) {
    value = Math.min(13, Math.max(1, value));
    store.changeElementCount(value);
    state.playing = false;
    state.loading = false;
}

async function applySteps(steps: number[][]) {
    for (const s of steps) {
        try {
            const e = await store.removeFrom(s[0]);
            await store.pushTo(s[1], e);
        } catch {
            break;
        }
    }
}

function fetchHanoiSteps(n: number): Promise<number[][]> {
    return fetch(`/api/hanoi?n=${encodeURIComponent(n)}`)
        .then(r => r.json());
}

</script>

<template>
    <div class="controls">
        <Button label="Play" class="p-button-success" @click="handlePlay()" :disabled="state.playing"
            :loading="state.loading" icon="pi pi-play" iconPos="right" />
        <Button label="Stop" class="p-button-danger" @click="handleStop()" icon="pi pi-stop" iconPos="right" />
        <InputNumber :modelValue="store.elementCount" @input="handleCountChange($event)" :showButtons="true" :min="1"
            :max="13" />
    </div>
    <div class="towers">
        <div class="tower-positioner" v-for="id in [0, 1, 2]">
            <Tower :tower-id="id" :height="towerHeight"></Tower>
        </div>
    </div>
</template>

<style scoped lang="scss">
.controls {
    display: flex;
    gap: 20px;
    margin-top: 60px;
    margin-bottom: 10px;
}

.towers {
    display: flex;
    gap: 15px;
    border: 1px solid var(--surface-border);
    padding: 50px 20px 20px 20px;
    border-radius: 6px;

    .tower-positioner {
        flex: 1 0;
    }
}
</style>