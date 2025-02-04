import {Primitive} from './Primitive';
import {z} from 'zod';

export class PrimitiveArray<T extends Primitive = Primitive> extends Primitive {
    constructor(
        private readonly value: T[],
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }

    public ensureHomogenous<TType extends T>(type: new (...args: any[]) => TType): PrimitiveArray<TType> {
        z.array(z.instanceof(type))
            .parse(this.getValue());

        return this as unknown as PrimitiveArray<TType>;
    }
}
