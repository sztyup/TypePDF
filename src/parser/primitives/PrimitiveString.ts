import {Primitive} from './Primitive';

export class PrimitiveString extends Primitive {
    constructor(
        private readonly value: string,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }
}
