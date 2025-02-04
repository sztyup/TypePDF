import type {BaseCommand} from '../BaseCommand';
import {PrimitiveReference} from './primitives/PrimitiveReference';
import {PrimitiveDictionary} from './primitives/PrimitiveDictionary';
import {Catalog} from '../objects/Catalog';
import type {Stream} from './streams/Stream';
import {Parser} from './Parser';

export class PdfDocument {
    constructor(private readonly stream: Stream) {
    }

    public async parse() {
        const parser = new Parser(this.stream);

        const {xref, trailer} = await parser.readTrailer();
        const xrefTable = await parser.readXref(xref);

        console.log(trailer);
        const rootLocation = xrefTable[trailer.Root.getObjectNumber()] ?? null;

        if (rootLocation === null) {
            throw new Error('Root does not exist at referenced location');
        }

        const rootTable = await parser.readIndirectObject(rootLocation);
        if (!(rootTable instanceof PrimitiveDictionary)) {
            throw new Error('Invalid Root entry');
        }
        const catalog = new Catalog(rootTable);
        console.log(catalog);
    }

    public async readRoot(ref: PrimitiveReference) {

    }

    public execute<Keys extends string, T extends Record<Keys, BaseCommand<any>>>(commands: T): { [K in keyof T]: ReturnType<T[K]['getResult']> } {
        // @ts-ignore
        return {};
    }
}
