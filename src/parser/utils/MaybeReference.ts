import type {Primitive} from '../primitives/Primitive';
import {z} from 'zod';
import {PrimitiveReference} from '../primitives/PrimitiveReference';
import {PrimitiveDictionary} from '../primitives/PrimitiveDictionary';

export type MaybeReference<T extends Primitive> = T | PrimitiveReference;

export type ShouldBeReference<T extends Primitive> = T | PrimitiveReference;

type Constructor<T> = new (...args: any[]) => T;

export function dictNullable<T>(type: new (dict: PrimitiveDictionary) => T, data: Primitive | undefined): T | PrimitiveReference | undefined {
    const dict = getDataNullable(PrimitiveDictionary, data);
    if (dict === undefined || dict instanceof PrimitiveReference) {
        return dict;
    }

    return new type(dict);
}

export function getDataNullable<T extends Primitive>(type: Constructor<T>, data: Primitive | undefined): MaybeReference<T> | undefined {
    if (data === undefined) {
        return undefined;
    }

    return getData(type, data);
}

export function getData<T extends Primitive>(type: Constructor<T>, data: Primitive | undefined): MaybeReference<T> {
    const result = z.instanceof(PrimitiveReference).safeParse(data);
    if (result.success) {
        return result.data;
    }

    return getDirectData(type, data);
}

export function getDirectDataNullable<T extends Primitive>(type: Constructor<T>, data: Primitive | undefined): T | undefined {
    if (data === undefined) {
        return undefined;
    }

    return getDirectData(type, data);
}

export function getDirectData<T extends Primitive>(type: Constructor<T>, data: Primitive | undefined): T {
    return z.instanceof(type).parse(data);
}
