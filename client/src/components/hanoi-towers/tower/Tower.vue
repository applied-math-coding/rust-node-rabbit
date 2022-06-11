<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { TowerElement } from './tower-element';
import { useStore } from '@/store';
import { BehaviorSubject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

const props = defineProps<{
    towerId: number,
    numberElements: number,
    height: string
}>();

const state = reactive({
    elements: [] as TowerElement[],
    animationEvent: new BehaviorSubject<TowerElement | null>(null)
});
const store = useStore();

onMounted(() => {
    state.elements = [...Array(props.numberElements)]
        .map((_, idx) => new TowerElement(idx + 1));
    //TODO compute the width inside the element (at init)
    store.$onAction(({ name, args }) => {
        switch (name) {
            case 'pushTo': {
                const [towerId, element] = args;
                if (towerId === props.towerId) {
                    element.isAdded = true;
                    state.elements.unshift(element);
                    state.animationEvent.pipe(
                        filter(e => !!e),
                        map(e => e as TowerElement),
                        first(e => e.value === element.value)
                    ).subscribe(e => {
                        e.isAdded = false;
                        store.pushed();
                    });
                }
                break;
            }
            case 'removeFrom': {
                const [towerId] = args;
                if (towerId === props.towerId && state.elements[0]) {
                    const element = state.elements[0];
                    element.isRemoved = true;
                    state.animationEvent.pipe(
                        filter(e => !!e),
                        map(e => e as TowerElement),
                        first(e => e.value === element.value)
                    ).subscribe(e => {
                        e.isRemoved = false;
                        state.elements.shift();
                        store.removed(e);
                    });
                }
            }
            default:
                break;
        }
    });
});
</script>

<template>
    <div class="tower" :style="{ 'height': height }">
        <div class="tower-element-wrapper" v-for="e in state.elements" @animationend="state.animationEvent.next(e)">
            <div class="tower-element" :class="{ 'is-added': e.isAdded, 'is-removed': e.isRemoved }">{{ e.value }}</div>
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