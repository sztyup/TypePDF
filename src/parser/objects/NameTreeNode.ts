import type {Primitive} from '../primitives/Primitive';
import {PrimitiveReference} from '../primitives/PrimitiveReference';
import {PrimitiveReal} from '../primitives/PrimitiveReal';
import {PrimitiveInteger} from '../primitives/PrimitiveInteger';
import {PrimitiveBoolean} from '../primitives/PrimitiveBoolean';
import {PrimitiveName} from '../primitives/PrimitiveName';
import {PrimitiveNull} from '../primitives/PrimitiveNull';
import type {PrimitiveDictionary} from '../primitives/PrimitiveDictionary';
import {z} from 'zod';
import {PrimitiveArray} from '../primitives/PrimitiveArray';
import {PrimitiveString} from '../primitives/PrimitiveString';

export class NameTreeNode {
    private static shallBeDirectDescendants = [
        PrimitiveReference,
        PrimitiveReal,
        PrimitiveInteger,
        PrimitiveBoolean,
        PrimitiveName,
        PrimitiveNull,
    ];

    constructor(
        private readonly Kids: PrimitiveReference[],
        private readonly Names: Record<string, Primitive>,
        private readonly LowerLimit: string,
        private readonly UpperLimit: string,
    ) {
    }

    static createFromDictionary(dict: PrimitiveDictionary): NameTreeNode {
        const {Kids, Nums, Limits} = z.object({
            Kids: z.instanceof(PrimitiveArray),
            Nums: z.instanceof(PrimitiveArray),
            Limits: z.instanceof(PrimitiveArray),
        }).parse(dict.getValue());

        const [lower, upper] = Limits.ensureHomogenous(PrimitiveString).getValue();
        if (!lower || !upper) {
            throw new Error('Invalid name tree node');
        }

        return new NameTreeNode(
            Kids.ensureHomogenous(PrimitiveReference).getValue(),
            this.createRecord(Nums),
            lower.getValue(),
            upper.getValue(),
        );
    }

    private static createRecord(nums: PrimitiveArray): Record<string, Primitive> {
        const record: Record<string, Primitive> = {};

        const array = nums.getValue();
        while (array.length > 0) {
            const key = array.shift();
            if (!(key instanceof PrimitiveString)) {
                throw new Error('Invalid name tree node');
            }

            const value = array.shift();
            if (!value) {
                throw new Error('Invalid name tree node');
            }
            this.checkValidDescendant(value);

            record[key.getValue()] = value;
        }

        return record;
    }

    private static checkValidDescendant(value: Primitive) {
        if (!this.shallBeDirectDescendants.some(type => value instanceof type)) {
            throw new Error('Invalid name tree node');
        }
    }
}
