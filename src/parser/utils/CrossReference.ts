export class CrossReference<T> {
    constructor(
        public readonly objectNumber: number,
        public readonly byteOffset: number,
        public readonly generationNumber: number,
    ) {
    }
}
