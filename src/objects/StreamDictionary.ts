import {PrimitiveDictionary} from '../parser/primitives/PrimitiveDictionary';
import {getDirectData, getDirectDataNullable} from '../parser/utils/MaybeReference';
import {PrimitiveInteger} from '../parser/primitives/PrimitiveInteger';
import {PrimitiveName} from '../parser/primitives/PrimitiveName';
import {PrimitiveArray} from '../parser/primitives/PrimitiveArray';
import type {PrimitiveNull} from '../parser/primitives/PrimitiveNull';
import type {Primitive} from '../parser/primitives/Primitive';

export class StreamDictionary {
    /**
     * The number of bytes from the beginning of the line following the keyword stream to the last byte just
     * before the keyword endstream.
     * (There may be an additional EOL marker, preceding endstream, that is not included
     * in the count and is not logically part of the stream data.)
     */
    public readonly Length: PrimitiveInteger;

    /**
     * The name, or an array of zero, one or several names, of filter(s) that shall be applied in processing
     * the stream data found between the keywords stream and endstream.
     * Multiple filters shall be specified in the order in which they are to be applied.
     */
    public readonly Filter?: PrimitiveName | PrimitiveArray<PrimitiveName>;

    /**
     * A parameter dictionary or an array of such dictionaries, used by the filters specified by Filter, respectively.
     */
    public readonly DecodeParms?: PrimitiveDictionary | PrimitiveArray<PrimitiveDictionary | PrimitiveNull>;

    // TODO F
    // TODO FFilter
    // TODO FDecodeParams

    /**
     * A non-negative integer representing the number of bytes in the decoded (defiltered) stream.
     * This value is only a hint; for some stream filters, it may not be possible to determine this value precisely.
     */
    public readonly DL?: PrimitiveInteger;

    constructor(dict: PrimitiveDictionary) {
        const data = dict.getValue();

        this.Length = getDirectData(PrimitiveInteger, data.Length);

        const {Filter, DecodeParms} = StreamDictionary.parseFilters(data);
        this.Filter = Filter;
        this.DecodeParms = DecodeParms;

        this.DL = getDirectDataNullable(PrimitiveInteger, data.DL);
    }

    static parseFilters(data: Record<string, Primitive>): {
        Filter?: PrimitiveName | PrimitiveArray<PrimitiveName>,
        DecodeParms?: PrimitiveDictionary | PrimitiveArray<PrimitiveDictionary | PrimitiveNull>,
    } {
        if (!data.Filter) {
            return {};
        }

        if (data.Filter instanceof PrimitiveName) {
            if (data.DecodeParms instanceof PrimitiveArray) {
                throw new Error('Multiple DecodeParams for a single Filter');
            }
            if (!(data.DecodeParms instanceof PrimitiveDictionary)) {
                throw new Error('Invalid DecodeParams for a single Filter');
            }

            return {
                Filter: data.Filter,
                DecodeParms: data.DecodeParms,
            };
        }

        if (data.Filter instanceof PrimitiveArray) {
            if (data.DecodeParms instanceof PrimitiveDictionary) {
                throw new Error('Single DecodeParams for multiple Filters');
            }
            if (!(data.DecodeParms instanceof PrimitiveArray)) {
                throw new Error('Invalid DecodeParams for multiple Filter');
            }

            return {
                Filter: data.Filter.ensureHomogenous(PrimitiveName),
                DecodeParms: data.DecodeParms.ensureHomogenous(PrimitiveDictionary),
            };
        }
        return {};
    }
}
