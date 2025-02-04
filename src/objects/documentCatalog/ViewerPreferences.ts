import {z} from 'zod';
import {PrimitiveBoolean} from '../../parser/primitives/PrimitiveBoolean';
import {PrimitiveName} from '../../parser/primitives/PrimitiveName';
import {PrimitiveArray} from '../../parser/primitives/PrimitiveArray';
import {PrimitiveInteger} from '../../parser/primitives/PrimitiveInteger';
import {PrimitiveDictionary} from '../../parser/primitives/PrimitiveDictionary';
import {ViewerPreferenceEnforce} from './ViewerPreferenceEnforce';
import type {NonFullScreenPageMode} from './NonFullScreenPageMode';
import type { Direction } from './Direction';

export class ViewerPreferences {
    /** A flag specifying whether to hide the interactive PDF processor’s tool bars when the document is active. */
    private readonly HideToolbar?: PrimitiveBoolean;

    /** A flag specifying whether to hide the interactive PDF processor’s menu bar when the document is active. */
    private readonly HideMenubar?: PrimitiveBoolean;

    /**
     * A flag specifying whether to hide user interface elements in the document’s window
     * (such as scroll bars and navigation controls), leaving only the document’s contents displayed.
     */
    private readonly HideWindowUI?: PrimitiveBoolean;

    /**  A flag specifying whether to resize the document’s window to fit the size of the first displayed page. */
    private readonly FitWindow?: PrimitiveBoolean;

    /** A flag specifying whether to position the document’s window in the centre of the screen. */
    private readonly CenterWindow?: PrimitiveBoolean;

    /**
     * A flag specifying whether the window’s title bar should display the document title taken from
     * the dc:title element of the XMP metadata stream.
     * If false, the title bar should instead display the name of the PDF file containing the document.
     * @pdf-since 1.4
     */
    private readonly DisplayDocTitle?: PrimitiveBoolean;

    /** The document’s page mode, specifying how to display the document on exiting full-screen mode */
    private readonly NonFullScreenPageMode?: PrimitiveName<NonFullScreenPageMode>;

    /**
     * The predominant logical content order for text
     * @pdf-since 1.3
     */
    private readonly Direction?: PrimitiveName<Direction>;

    /**
     * The name of the page boundary representing the area of a page that shall be displayed
     * when viewing the document on the screen.
     * The value is the key designating the relevant page boundary in the page object.
     * @pdf-since 1.4
     * @pdf-deprecated 2.0
     */
    private readonly ViewArea?: PrimitiveName;

    /**
     * The name of the page boundary to which the contents of a page shall be clipped
     * when viewing the document on the screen.
     * The value is the key designating the relevant page boundary in the page object
     * @pdf-since 1.4
     * @pdf-deprecated 2.0
     */
    private readonly ViewClip?: PrimitiveName;

    /**
     * The name of the page boundary representing the area of a page that shall be rendered
     * when printing the document
     * The value is the key designating the relevant page boundary in the page object
     * @pdf-since 1.4
     * @pdf-deprecated 2.0
     */
    private readonly PrintArea?: PrimitiveName;

    /**
     * The name of the page boundary to which the contents of a page shall be clipped
     * when printing the document.
     * The value is the key designating the relevant page boundary in the page object
     * @pdf-since 1.4
     * @pdf-deprecated 2.0
     */
    private readonly PrintClip?: PrimitiveName;

    /**
     * The page scaling option that shall be selected
     * when a print dialogue is displayed for this document. Valid values
     * are None, which indicates no page scaling, and AppDefault, which
     * indicates the interactive PDF processor’s default print scaling. If this
     * entry has an unrecognised value, AppDefault shall be used.
     * @pdf-since 1.6
     */
    private readonly PrintScaling?: PrimitiveName;

    /**
     * The paper handling option that shall be used when printing the PDF file from the print dialogue.
     * @pdf-since 1.7
     */
    private readonly Duplex?: PrimitiveName;

    /**
     * A flag specifying whether the PDF page size shall be used to select the input paper tray.
     * This setting influences only the preset values used to populate the print dialogue presented by
     * an interactive PDF processor.
     * If PickTrayByPDFSize is true, the check box in the print dialogue associated with
     * input paper tray shall be checked.
     * @pdf-since 1.7
     */
    private readonly PickTrayByPDFSize?: PrimitiveBoolean;

    /**
     * The page numbers used to initialise the print dialogue box when the PDF file is printed.
     * The array shall contain an even number of integers to be interpreted in pairs, with each pair
     * specifying the first and last pages in a sub-range of pages to be printed.
     * The first page of the PDF file shall be denoted by 1.
     * @pdf-since 1.7
     */
    private readonly PrintPageRange?: PrimitiveArray<PrimitiveInteger>;

    /**
     * The number of copies that shall be printed when the print dialog is opened for this PDF file.
     * @pdf-since 1.7
     */
    private readonly NumCopies?: PrimitiveInteger;

    /**
     * An array of names of Viewer preference settings that shall be enforced by PDF processors and that shall not be
     * overridden by subsequent selections in the application user interface.
     * @pdf-since 2.0
     */
    private readonly Enforce?: PrimitiveArray<PrimitiveName<ViewerPreferenceEnforce>>;

    constructor(dict: PrimitiveDictionary) {
        const data = z.object({
            HideToolbar: z.instanceof(PrimitiveBoolean).optional(),
            HideMenubar: z.instanceof(PrimitiveBoolean).optional(),
            HideWindowUI: z.instanceof(PrimitiveBoolean).optional(),
            FitWindow: z.instanceof(PrimitiveBoolean).optional(),
            CenterWindow: z.instanceof(PrimitiveBoolean).optional(),
            DisplayDocTitle: z.instanceof(PrimitiveBoolean).optional(),
            NonFullScreenPageMode: z.instanceof(PrimitiveName).optional(),
            Direction: z.instanceof(PrimitiveName).optional(),
            ViewArea: z.instanceof(PrimitiveName).optional(),
            ViewClip: z.instanceof(PrimitiveName).optional(),
            PrintArea: z.instanceof(PrimitiveName).optional(),
            PrintClip: z.instanceof(PrimitiveName).optional(),
            PrintScaling: z.instanceof(PrimitiveName).optional(),
            Duplex: z.instanceof(PrimitiveName).optional(),
            PickTrayByPDFSize: z.instanceof(PrimitiveBoolean).optional(),
            PrintPageRange: z.instanceof(PrimitiveArray).optional()
                .transform(arr => arr?.ensureHomogenous(PrimitiveInteger)),
            NumCopies: z.instanceof(PrimitiveInteger).optional(),
            Enforce: z.instanceof(PrimitiveArray).optional(),
        }).parse(dict.getValue());

        if (data.Enforce) {
            const names = data.Enforce
                .ensureHomogenous(PrimitiveName)
                .getValue()
                .map(name => name.ensureEnum(ViewerPreferenceEnforce));

            this.Enforce = new PrimitiveArray(names);

            delete data.Enforce;
        }

        Object.assign(this, data);
    }
}
