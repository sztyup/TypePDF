import {Primitive} from './Primitive';

export class PrimitiveReal extends Primitive {
    constructor(
        private readonly value: number,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }
}
