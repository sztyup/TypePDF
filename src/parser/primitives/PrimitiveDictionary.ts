import {Primitive} from './Primitive';

export class PrimitiveDictionary extends Primitive {
    constructor(
        private readonly value: Record<string, Primitive>,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }
}
