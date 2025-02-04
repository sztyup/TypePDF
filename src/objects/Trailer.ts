import {PrimitiveInteger} from '../parser/primitives/PrimitiveInteger';
import {PrimitiveReference} from '../parser/primitives/PrimitiveReference';
import {PrimitiveDictionary} from '../parser/primitives/PrimitiveDictionary';

export class Trailer {
    public Size: number;

    public Prev: PrimitiveInteger | null = null;

    public Root: PrimitiveReference;

    public Info: PrimitiveReference;

    constructor(primitive: PrimitiveDictionary) {
        const size = primitive.getValue()['Size'] ?? null;
        if (size === null) {
            throw new Error('Trailer does not contain required Size attribute');
        }
        if (!(size instanceof PrimitiveInteger)) {
            throw new Error('Trailer Size is not integer');
        }
        this.Size = size.getValue();

        const prev = primitive.getValue()['Prev'] ?? null;
        if (prev !== null) {
            if (!(prev instanceof PrimitiveInteger)) {
                throw new Error('Trailer has invalid Prev attribute');
            }

            this.Prev = prev;
        }

        const root = primitive.getValue()['Root'] ?? null;
        if (root === null) {
            throw new Error('Trailer does not contain required Root attribute');
        }
        if (!(root instanceof PrimitiveReference)) {
            throw new Error('Trailer Root is not a reference');
        }
        this.Root = root;
        // TODO Encrypt

        const info = primitive.getValue()['Info'] ?? null;
        if (info === null) {
            throw new Error('Trailer does not contain required Info attribute');
        }
        if (!(info instanceof PrimitiveReference)) {
            throw new Error('Trailer Info is not a reference');
        }
        this.Info = info;

    }
}
