import {PrimitiveReference} from '../primitives/PrimitiveReference';
import type {Primitive} from '../primitives/Primitive';
import type {PrimitiveDictionary} from '../primitives/PrimitiveDictionary';
import {PrimitiveArray} from '../primitives/PrimitiveArray';
import {PrimitiveReal} from '../primitives/PrimitiveReal';
import {PrimitiveInteger} from '../primitives/PrimitiveInteger';
import {PrimitiveBoolean} from '../primitives/PrimitiveBoolean';
import {PrimitiveName} from '../primitives/PrimitiveName';
import {PrimitiveNull} from '../primitives/PrimitiveNull';
import {z} from 'zod';

export class NumberTreeNode {
    private static shallBeDirectDescendants = [
        PrimitiveReference,
        PrimitiveReal,
        PrimitiveInteger,
        PrimitiveBoolean,
        PrimitiveName,
        PrimitiveNull,
    ];

    private readonly Kids: PrimitiveReference[];

    private readonly Nums: Record<number, Primitive>;

    private readonly LowerLimit: number;

    private readonly UpperLimit: number;

    constructor(dict: PrimitiveDictionary) {
        const {Kids, Nums, Limits} = z.object({
            Kids: z.instanceof(PrimitiveArray),
            Nums: z.instanceof(PrimitiveArray),
            Limits: z.instanceof(PrimitiveArray),
        }).parse(dict.getValue());

        const [lower, upper] = Limits.ensureHomogenous(PrimitiveInteger);
        if (!lower || !upper) {
            throw new Error('Invalid number tree node');
        }

        this.Kids = Kids.ensureHomogenous(PrimitiveReference);
        this.Nums = NumberTreeNode.createRecord(Nums);
        this.LowerLimit = lower.getValue();
        this.UpperLimit = upper.getValue();
    }

    private static createRecord(nums: PrimitiveArray): Record<number, Primitive> {
        const record: Record<number, Primitive> = {};

        const array = nums.getValue();
        while (array.length > 0) {
            const key = array.shift();
            if (!(key instanceof PrimitiveInteger)) {
                throw new Error('Invalid number tree node');
            }

            const value = array.shift();
            if (!value) {
                throw new Error('Invalid number tree node');
            }
            this.checkValidDescendant(value);

            record[key.getValue()] = value;
        }

        return record;
    }

    private static checkValidDescendant(value: Primitive) {
        if (!this.shallBeDirectDescendants.some(type => value instanceof type)) {
            throw new Error('Invalid number tree node');
        }
    }
}
