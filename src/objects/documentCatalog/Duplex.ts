/**
 * The paper handling option that shall be used
 * when printing the PDF file from the print dialogue.
 */
export enum Duplex {
    /** Print single-sided */
    Simplex = 'Simplex',

    /** Duplex and flip on the short edge of the sheet */
    DuplexFlipShortEdge = 'DuplexFlipShortEdge',

    /** Duplex and flip on the long edge of the sheet */
    DuplexFlipLongEdge = 'DuplexFlipLongEdge',
}
