import {Primitive} from './Primitive';

export class PrimitiveInteger extends Primitive {
    constructor(
        private readonly value: number,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }
}
