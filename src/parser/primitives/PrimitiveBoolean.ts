import {Primitive} from './Primitive';

export class PrimitiveBoolean extends Primitive {
    constructor(
        private readonly value: boolean,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }
}
