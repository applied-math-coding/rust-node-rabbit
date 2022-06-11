import { defineStore } from 'pinia'
import { TowerElement } from './components/hanoi-towers/tower/tower-element';

export const useStore = defineStore('main', {
    state: () => {
        return {
            elementCount: 5,
            towers: initTowers(5)
        }
    },
    actions: {
        removeFrom(towerId: number) {
            return new Promise<TowerElement>((res, rej) => {
                this.towers[towerId][0].isRemoved = true;
                const unsubscribe = this.$onAction(({ name, after, args }) => {
                    if (name === 'animationEnd') {
                        const [e] = args;
                        e.isRemoved = false;
                        this.towers[towerId].shift();
                        unsubscribe();
                        after(() => res(e as TowerElement));
                    } else if (name === 'stop') {
                        unsubscribe();
                        after(() => rej());
                    }
                });
            });
        },
        pushTo(towerId: number, element: TowerElement) {
            return new Promise<void>((res, rej) => {
                this.towers[towerId].unshift(element);
                element.isAdded = true;
                const unsubscribe = this.$onAction(({ name, after }) => {
                    if (name === 'animationEnd') {
                        element.isAdded = false;
                        unsubscribe();
                        after(() => res());
                    } else if (name === 'stop') {
                        unsubscribe();
                        after(() => rej());
                    }
                })
            });
        },
        animationEnd(e: TowerElement) { },
        stop() { },
        changeElementCount(n: number) {
            this.stop();
            this.elementCount = n;
            this.towers = initTowers(this.elementCount);
        }
    },
});

function initTowers(n: number): TowerElement[][] {
    return [0, 1, 2].map(
        i => i > 0 ? [] :
            [...Array(n)].map((_, idx) => new TowerElement(idx + 1, `${100 * 0.75 ** (n - 1 - idx)}%`))
    );
}
