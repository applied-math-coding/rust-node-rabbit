export class TowerElement {
    value: number;
    isAdded: boolean = false;
    isRemoved: boolean = false;
    width: string;

    constructor(value: number, width: string) {
        this.value = value;
        this.width = width;
    }
}