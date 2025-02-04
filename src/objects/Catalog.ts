import {PrimitiveName} from '../parser/primitives/PrimitiveName';
import {PrimitiveDictionary} from '../parser/primitives/PrimitiveDictionary';
import {NumberTreeNode} from '../parser/objects/NumberTreeNode';
import {ViewerPreferences} from './documentCatalog/ViewerPreferences';
import {PageLayout} from './documentCatalog/PageLayout';
import {NameDictionary} from './NameDictionary';
import {
    dictNullable,
    getData,
    getDataNullable,
    getDirectData,
    getDirectDataNullable,
    type MaybeReference,
    type ShouldBeReference,
} from '../parser/utils/MaybeReference';
import {PageMode} from './documentCatalog/PageMode';
import {Outline} from './outline/Outline';
import {Thread} from './Thread';
import {PrimitiveArray} from '../parser/primitives/PrimitiveArray';
import {InteractiveFormDict} from './documentCatalog/InteractiveFormDict';
import {PrimitiveStream} from '../parser/primitives/PrimitiveStream';

export class Catalog {
    /**
     * The version of the PDF specification to which the document conforms (for example, 1.4) if later than the version
     * specified in the file’s header (see 7.5.2, "File header").
     * If the header specifies a later version, or if this entry is absent, the document
     * shall conform to the version specified in the header.
     * This entry enables a PDF processor to update the version using an incremental update.
     * @pdf-since 1.4
     */
    public Version?: PrimitiveName;

    /**
     * An extensions dictionary containing developer prefix identification and version numbers for developer
     * extensions that occur in this document.
     */
    public Extensions?: MaybeReference<PrimitiveDictionary>;

    /**
     * The page tree node that shall be the root of the document’s page tree.
     */
    public Pages: ShouldBeReference<PrimitiveDictionary>;

    /**
     * A number tree defining the page labelling for the document.
     * The keys in this tree shall be page indices; the corresponding values shall be page label dictionaries.
     * Each page index shall denote the first page in a labelling range to which the specified page label
     * dictionary applies.
     * The tree shall include a value for page index 0.
     * @pdf-since 1.3
     */
    public PageLabels?: MaybeReference<NumberTreeNode>;

    /**
     * The document’s name dictionary.
     * @pdf-since 1.2
     */
    public Names?: MaybeReference<NameDictionary>;

    /**
     * A dictionary of names and corresponding destinations.
     * @pdf-since 1.1
     */
    public Dests?: MaybeReference<PrimitiveDictionary>;

    /**
     * A viewer preferences dictionary specifying the way the document shall be displayed on the screen.
     * If this entry is absent, PDF readers shall use their own current user preference settings.
     * @pdf-since 1.2
     */
    public ViewerPreferences?: MaybeReference<ViewerPreferences>;

    /** A name object specifying the page layout shall be used when the document is opened. */
    public PageLayout?: PrimitiveName<PageLayout>;

    /** A name object specifying how the document shall be displayed when opened */
    public PageMode?: PrimitiveName<PageMode>;

    /** The outline dictionary that shall be the root of the document’s outline hierarchy */
    public Outlines?: MaybeReference<Outline>;

    /**
     * An array of thread dictionaries that shall represent the document’s article threads
     * @pdf-since 1.1
     */
    public Threads?: MaybeReference<PrimitiveArray<Thread>>;

    // TODO OpenAction
    // TODO AA
    // TODO URI

    public AcroForm?: MaybeReference<InteractiveFormDict>;

    public Metadata?: ShouldBeReference<PrimitiveStream>;

    constructor(dict: PrimitiveDictionary) {
        const data = dict.getValue();

        const type = getDirectData(PrimitiveName, data.Type);

        if (type && type.getValue() !== 'Catalog') {
            throw new Error('Invalid Document Catalog');
        }

        this.Version = getDirectDataNullable(PrimitiveName, data.Version);
        this.Extensions = getDataNullable(PrimitiveDictionary, data.Extensions);
        this.Pages = getData(PrimitiveDictionary, data.Pages);
        this.PageLabels = dictNullable(NumberTreeNode, data.PageLabels);
        this.Names = dictNullable(NameDictionary, data.Names);
        this.Dests = getDataNullable(PrimitiveDictionary, data.Dests);
        this.ViewerPreferences = dictNullable(ViewerPreferences, data.ViewerPreferences);
        this.PageLayout = getDirectDataNullable(PrimitiveName, data.PageLayout)?.ensureEnum(PageLayout);
        this.PageMode = getDirectDataNullable(PrimitiveName, data.PageMode)?.ensureEnum(PageMode);
        this.Outlines = dictNullable(Outline, data.Outlines);
        this.Threads = getDataNullable(PrimitiveArray, data.Threads);
        if (this.Threads instanceof PrimitiveArray) {
            this.Threads.ensureHomogenous(Thread);
        }

        this.AcroForm = dictNullable(InteractiveFormDict, data.AcroForm);
        this.Metadata = getDataNullable(PrimitiveStream, data.Metadata);
    }
}
