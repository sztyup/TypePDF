/**
 * The document’s page mode, specifying how to display the
 * document on exiting full-screen mode:
 */
export enum NonFullScreenPageMode {
    /** Neither document outline nor thumbnail images visible */
    UseNone = 'UseNone',

    /** Document outline visible */
    UseOutlines = 'UseOutlines',

    /** Thumbnail images visible */
    UseThumbs = 'UseThumbs',

    /** Optional content group panel visible */
    UseOC = 'UseOC',
}
