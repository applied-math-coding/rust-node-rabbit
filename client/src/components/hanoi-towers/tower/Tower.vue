<script setup lang="ts">
import { useStore } from '@/store';
import type { TowerElement } from './tower-element';

defineProps<{
    towerId: number,
    height: string
}>();

const store = useStore();

function handleAnimationEnd(e: TowerElement) {
    store.animationEnd(e);
}

</script>

<template>
    <div class="tower" :style="{ 'height': height }">
        <div class="tower-element-wrapper" v-for="e in store.towers[towerId]" @animationend="handleAnimationEnd(e)"
            :key="e.value">
            <div class="tower-element" :class="{ 'is-added': e.isAdded, 'is-removed': e.isRemoved }"
                :style="{ 'width': e.width }">{{ e.value }}</div>
        </div>
    </div>

</template>

<style scoped lang="scss">
@keyframes fadin {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadout {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.tower {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .tower-element-wrapper {
        display: flex;
        justify-content: center;

        .tower-element {
            width: 100px; //TODO
            height: var(--tower-element-height);
            border: 1px solid black;
            border-radius: 5px;
            background-color: blue;

            &.is-added {
                animation-duration: 1.5s;
                animation-name: fadin;
            }

            &.is-removed {
                animation-duration: 1.5s;
                animation-name: fadout;
            }
        }
    }
}
</style>