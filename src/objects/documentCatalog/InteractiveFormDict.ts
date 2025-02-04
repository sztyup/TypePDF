import {PrimitiveArray} from '../../parser/primitives/PrimitiveArray';
import {PrimitiveDictionary} from '../../parser/primitives/PrimitiveDictionary';
import {PrimitiveReference} from '../../parser/primitives/PrimitiveReference';
import {PrimitiveBoolean} from '../../parser/primitives/PrimitiveBoolean';
import {PrimitiveInteger} from '../../parser/primitives/PrimitiveInteger';
import {
    dictNullable,
    getDirectData,
    getDirectDataNullable,
    type MaybeReference,
} from '../../parser/utils/MaybeReference';
import {ResourceDictionary} from '../resources/ResourceDictionary';
import {PrimitiveString} from '../../parser/primitives/PrimitiveString';

export class InteractiveFormDict {
    /**
     * An array of references to the document’s root fields (those with no ancestors in the field hierarchy)
     */
    private readonly Fields: PrimitiveArray<PrimitiveReference>;

    /**
     * A flag specifying whether to construct appearance streams
     * and appearance dictionaries for all widget annotations in the document.
     * @pdf-deprecated 2.0
     */
    private readonly NeedAppearances?: PrimitiveBoolean;

    /**
     * A set of flags specifying various document-level characteristics related to signature fields.
     * @pdf-since 1.3
     */
    private readonly SigFlags?: PrimitiveInteger;

    /**
     * An array of indirect references to field dictionaries with calculation actions,
     * defining the calculation order in which their values will be recalculated when the value of any field changes
     * @pdf-since 1.3
     */
    private readonly CO?: PrimitiveArray<PrimitiveReference>;

    /**
     * A resource dictionary containing default resources (such as fonts, patterns, or colour spaces)
     * that shall be used by form field appearance streams.
     * At a minimum, this dictionary shall contain a Font entry specifying the resource name and font
     * dictionary of the default font for displaying text.
     */
    private readonly DR?: MaybeReference<ResourceDictionary>;

    /**
     * A document-wide default value for the DA attribute of variable text fields
     */
    private readonly DA?: PrimitiveString;

    /**
     * A document-wide default value for the Q attribute of variable text fields
     */
    private readonly Q?: PrimitiveInteger;

    // TODO XFA

    constructor(dict: PrimitiveDictionary) {
        const data = dict.getValue();

        this.Fields = getDirectData(PrimitiveArray, data.Fields).ensureHomogenous(PrimitiveReference);
        this.NeedAppearances = getDirectDataNullable(PrimitiveBoolean, data.NeedAppearances);
        this.SigFlags = getDirectDataNullable(PrimitiveInteger, data.SigFlags);
        this.CO = getDirectDataNullable(PrimitiveArray, data.CO)?.ensureHomogenous(PrimitiveReference);
        this.DR = dictNullable(ResourceDictionary, data.DR);
        this.DA = getDirectDataNullable(PrimitiveString, data.DA);
        this.Q = getDirectDataNullable(PrimitiveInteger, data.Q);
    }
}
