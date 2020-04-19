
export default interface IManager<T> {
    remove(entity: T): void;
    add(entity: T): void;
    get(): T[];
}

export class Manager<T> implements IManager<T> {

    entities: T[];

    constructor(){
        this.entities = [];
    }

    remove(entity: T) {
        const idx = this.entities.indexOf(entity);
        if(idx !== -1) {
            this.entities.splice(idx, 1);
        }
    }

    add(entity: T) {
        this.entities.push(entity);
    }

    get() {
        return this.entities;
    }
}
