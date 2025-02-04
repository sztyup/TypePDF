import {Primitive} from './Primitive';

export class PrimitiveReference extends Primitive {
    constructor(
        private readonly objectNumber: number,
        private readonly generationNumber: number,
    ) {
        super();
    }

    public getObjectNumber() {
        return this.objectNumber;
    }

    public getGenerationNumber() {
        return this.generationNumber;
    }
}
