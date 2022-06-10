import { defineStore } from 'pinia'
import type { TowerElement } from './components/hanoi-towers/tower/tower-element';

export const useStore = defineStore('main', {
    actions: {
        async removeFrom(towerId: number) {
            return new Promise<TowerElement>(res => {
                this.$onAction(({ name, after, args: [e] }) => {
                    if (name === 'removed') {
                        after(() => res(e as TowerElement));
                    }
                })
            });
        },
        pushTo(towerId: number, element: TowerElement) {
            return new Promise<void>(res => {
                this.$onAction(({ name, after }) => {
                    if (name === 'pushed') {
                        after(() => res());
                    }
                })
            });
        },
        removed(e: TowerElement) { },
        pushed() { }
    },
})
