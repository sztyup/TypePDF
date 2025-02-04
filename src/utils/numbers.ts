export function isNumeric(string: string): boolean {
    return !Number.isNaN(parseInt(string));
}
