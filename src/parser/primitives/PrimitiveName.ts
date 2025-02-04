import {Primitive} from './Primitive';

export class PrimitiveName<T extends string = string> extends Primitive {
    constructor(
        private readonly value: T,
    ) {
        super();
    }

    public getValue() {
        return this.value;
    }

    public ensureEnum<TEnum extends Record<string, string>>(values: TEnum): PrimitiveName<TEnum[keyof TEnum]> {
        for (const value of Object.values(values)) {
            if (value === this.getValue()) {
                return this as unknown as PrimitiveName<TEnum[keyof TEnum]>;
            }
        }

        throw new Error(`Invalid value: ${this.getValue()} for enum (${values}`);
    }
}
