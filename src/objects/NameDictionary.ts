import {z} from 'zod';
import type {PrimitiveDictionary} from '../parser/primitives/PrimitiveDictionary';
import {NameTreeNode} from '../parser/objects/NameTreeNode';

export class NameDictionary {
    private readonly Dests?: NameTreeNode;

    private readonly AP?: NameTreeNode;

    private readonly JavaScript?: NameTreeNode;

    private readonly Pages?: NameTreeNode;

    private readonly Templates?: NameTreeNode;

    private readonly IDS?: NameTreeNode;

    private readonly URLS?: NameTreeNode;

    private readonly EmbeddedFiles?: NameTreeNode;

    private readonly AlternatePresentations?: NameTreeNode;

    private readonly Renditions?: NameTreeNode;

    constructor(dict: PrimitiveDictionary) {
        const data = z.object({
            Dests: z.instanceof(NameTreeNode).optional(),
            AP: z.instanceof(NameTreeNode).optional(),
            JavaScript: z.instanceof(NameTreeNode).optional(),
            Pages: z.instanceof(NameTreeNode).optional(),
            Templates: z.instanceof(NameTreeNode).optional(),
            IDS: z.instanceof(NameTreeNode).optional(),
            URLS: z.instanceof(NameTreeNode).optional(),
            EmbeddedFiles: z.instanceof(NameTreeNode).optional(),
            AlternatePresentations: z.instanceof(NameTreeNode).optional(),
            Renditions: z.instanceof(NameTreeNode).optional(),
        }).parse(dict);

        Object.assign(this, data);
    }
}
