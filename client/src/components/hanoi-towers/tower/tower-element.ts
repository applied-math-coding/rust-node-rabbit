export class TowerElement {
    value: number;
    isAdded: boolean = false;
    isRemoved: boolean = false;

    constructor(value: number) {
        this.value = value;
    }
}