import {StreamDictionary} from './StreamDictionary';
import {PrimitiveName} from '../parser/primitives/PrimitiveName';
import type {PrimitiveDictionary} from '../parser/primitives/PrimitiveDictionary';
import {getDirectData} from '../parser/utils/MaybeReference';

export class MetadataStreamDictionary extends StreamDictionary {
    public readonly Type: PrimitiveName;
    public readonly Subtype: PrimitiveName;

    constructor(dict: PrimitiveDictionary) {
        super(dict);

        const data = dict.getValue();
        this.Type = getDirectData(PrimitiveName, data.Type);
        this.Subtype = getDirectData(PrimitiveName, data.Subtype);

        if (this.Type.getValue() !== 'Metadata') {
            throw new Error(`Invalid Type for metadata: ${this.Type.getValue()}`);
        }

        if (this.Subtype.getValue() !== 'XML') {
            throw new Error(`Invalid Subtype for metadata: ${this.Subtype.getValue()}`);
        }
    }
}
