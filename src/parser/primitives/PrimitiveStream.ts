import {Primitive} from './Primitive';
import type {StreamDictionary} from '../../objects/StreamDictionary';

export class PrimitiveStream extends Primitive {
    constructor(
        private readonly dict: StreamDictionary,
        private readonly startOffset: number,
        private readonly endOffset: number,
    ) {
        super();
    }

    getDict() {
        return this.dict;
    }

    public getLength() {
        return this.dict.Length;
    }

    public getStartOffset() {
        return this.startOffset;
    }

    public getEndOffset() {
        return this.endOffset;
    }
}
