import {PrimitiveBoolean} from './primitives/PrimitiveBoolean';
import {isNumeric} from '../utils/numbers';
import {PrimitiveInteger} from './primitives/PrimitiveInteger';
import {PrimitiveReal} from './primitives/PrimitiveReal';
import {PrimitiveString} from './primitives/PrimitiveString';
import {PrimitiveName} from './primitives/PrimitiveName';
import {PrimitiveArray} from './primitives/PrimitiveArray';
import {PrimitiveDictionary} from './primitives/PrimitiveDictionary';
import type {Primitive} from './primitives/Primitive';
import {PrimitiveStream} from './primitives/PrimitiveStream';
import {PrimitiveReference} from './primitives/PrimitiveReference';
import {PrimitiveNull} from './primitives/PrimitiveNull';
import {Trailer} from '../objects/Trailer';
import type {Stream} from './streams/Stream';
import {StreamDictionary} from '../objects/StreamDictionary';

export class Parser {
    constructor(
        private readonly stream: Stream,
    ) {
    }

    private WHITESPACES = [
        '\x00',
        '\x09',
        '\x0A',
        '\x0C',
        '\x0D',
        '\x20',
    ];

    private DELIMITERS = [
        '(',
        ')',
        '<',
        '>',
        '[',
        ']',
        '{',
        '}',
        '/',
        '%',
    ];

    public async readTrailer(): Promise<{xref: number, trailer: Trailer}> {
        this.stream.seekEnd();
        await this.readReverseUntil(this.WHITESPACES); // EOF
        await this.readReverseUntil(this.WHITESPACES); // Xref location
        const xref = await this.readNumber();

        while (this.stream.currentPosition() > 0) {
            const line = await this.readReverseUntil(this.WHITESPACES);
            if (line === 'trailer') {
                await this.readUntil(this.WHITESPACES);
                await this.readUntil(this.WHITESPACES);

                return {
                    xref: xref.getValue(),
                    trailer: new Trailer(await this.readDict()),
                };
            }
        }

        throw new Error('No trailer found');
    }

    public async readXref(at: number) {
        this.stream.seekAbsolute(at);
        const line = await this.readUntil(this.WHITESPACES);
        if (line !== 'xref') {

        }

        const references: Record<number, number> = {};
        while (!this.stream.eof()) {
            const firstObjectNumber = (await this.readNumber()).getValue();
            const numberOfEntries = (await this.readNumber()).getValue();

            for (let i = 1; i <= numberOfEntries; i++) {
                const byteOffset = await this.readNumber();
                const generationNumber = await this.readNumber();
                await this.seekSpace();
                const keyword = await this.stream.read(1);
                await this.seekSpace();

                if (keyword === 'n') {
                    references[firstObjectNumber + i - 1] = byteOffset.getValue();
                }
            }

            if (await this.stream.peek(7) === 'trailer') {
                break;
            }
        }

        return references;
    }

    public async readIndirectObject(at: number) {
        this.stream.seekAbsolute(at);
        const objectNumber = await this.readNumber();
        const generationNumber = await this.readNumber();
        if (await this.readUntil(this.WHITESPACES) !== 'obj') {
            throw new Error('Invalid indirect object');
        }
        return await this.readObject();
    }

    public async readObject(at: number | null = null): Promise<Primitive> {
        if (at !== null) {
            this.stream.seekAbsolute(at);
        }

        const start = await this.stream.peek(1);
        switch (start) {
            case 't':
                if (await this.stream.read(4) === 'true') {
                    return new PrimitiveBoolean(true);
                }
                throw new Error('Invalid file');
            case 'f':
                if (await this.stream.read(5) === 'false') {
                    return new PrimitiveBoolean(false);
                }
                throw new Error('Invalid file');
            case '+':
            case '-':
            case '.':
                return await this.readNumber();
            case '(':
                return await this.readLiteralString();
            case '<':
                if (await this.stream.peek(2) === '<<') {
                    await this.stream.read(2); // << characters
                    const dict = await this.readDict();
                    if (await this.stream.peek(6) === 'stream') {
                        return await this.readStream(dict);
                    } else {
                        return dict;
                    }
                } else {
                    return await this.readHexadecimalString();
                }
            case '/':
                return await this.readName();
            case '[':
                return await this.readArray();
            case 'n':
                if (await this.stream.peek(4) === 'null') {
                    await this.stream.read(4);
                    return new PrimitiveNull();
                }
            // Fall through
            default:
                if (isNumeric(start)) {
                    const number = await this.readNumber();
                    const backupPosition = this.stream.currentPosition();
                    try {
                        const second = await this.readObject();
                        if (second instanceof PrimitiveInteger) {
                            await this.seekSpace();
                            if (await this.stream.read(1) === 'R') {
                                return new PrimitiveReference(number.getValue(), second.getValue());
                            }
                        } else {
                            this.stream.seekAbsolute(backupPosition);
                        }
                    } catch (error) {
                        this.stream.seekAbsolute(backupPosition);
                    }

                    return number;
                }
                throw new Error(`Invalid object: ${start} at ${this.stream.currentPosition()}`);
        }
    }

    private async readNumber(): Promise<PrimitiveInteger | PrimitiveReal> {
        let string = await this.stream.read(1);

        while (!this.stream.eof()) {
            const char = await this.stream.read(1);
            if (char === '.' || isNumeric(char)) {
                string += char;
            } else {
                break;
            }
        }

        if (string.startsWith('.')) {
            string = '0' + string;
        }

        if (string.includes('.')) {
            return new PrimitiveReal(parseFloat(string));
        } else {
            return new PrimitiveInteger(parseInt(string));
        }
    }

    private async readLiteralString(): Promise<PrimitiveString> {
        await this.stream.read(1); // open parenthesis
        let parenCount = 1;
        let string = '';

        while (parenCount > 0 || !this.stream.eof()) {
            let char = await this.stream.read(1);
            if (char === '(') {
                parenCount++;
            }
            if (char === ')') {
                parenCount--;
            }

            if (char === '\\') {
                const escaped = await this.stream.read(1);
                switch (escaped) {
                    case 'n':
                        char = '\n';
                        break;
                    case 'r':
                        char = '\r';
                        break;
                    case 't':
                        char = '\t';
                        break;
                    case 'b':
                        char = '\b';
                        break;
                    case 'f':
                        char = '\f';
                        break;
                    case '(':
                        char = '(';
                        break;
                    case ')':
                        char = ')';
                        break;
                    case '\\':
                        char = '\\';
                        break;
                    default:
                        const octal = escaped + await this.stream.read(2);
                        const number = parseInt(octal, 8);
                        if (!Number.isNaN(number)) {
                            char = String.fromCharCode(number);
                            break;
                        }
                        throw new Error(`Invalid escape sequence: ${octal}`);
                }
            }

            string += char;
        }

        if (parenCount > 0) {
            throw new Error(`Unterminated string: ${string}`);
        }

        return new PrimitiveString(
            string.substring(1, -1),
        );
    }

    private async readHexadecimalString(): Promise<PrimitiveString> {
        await this.stream.read(1); // Open brace
        let string = '';
        while (!this.stream.eof()) {
            const char = await this.stream.read(2);
            if (char[0] === '>') {
                await this.stream.read(-1);
                break;
            }

            if (char[1] === '>') {
                throw new Error(`Invalid hexadecimal string: ${string + char}`);
            }

            const number = parseInt(char, 16);

            if (Number.isNaN(number)) {
                throw new Error(`Invalid hexadecimal string: ${string + char}`);
            }

            string += String.fromCharCode(number);
        }

        return new PrimitiveString(string);
    }

    private async readName(): Promise<PrimitiveName> {
        const starter = await this.stream.read(1);
        if (starter !== '/') {
            throw new Error(`Invalid name start at ${this.stream.currentPosition()}`);
        }

        let string = '';
        while (!this.stream.eof()) {
            const char = await this.stream.read(1);
            if (this.WHITESPACES.includes(char)) {
                break;
            }

            if (char === '#') {
                const escaped = await this.stream.read(2);
                const number = parseInt(escaped, 16);
                if (Number.isNaN(number)) {
                    throw new Error(`Invalid escaped character sequence: ${string + char}`);
                }

                string += String.fromCharCode(number);
            } else {
                string += char;
            }
        }

        return new PrimitiveName(string);
    }

    private async readArray(): Promise<PrimitiveArray> {
        await this.stream.read(1); // Start bracket

        const array = [];
        while (!this.stream.eof()) {
            await this.seekSpace();

            array.push(await this.readObject());

            await this.seekSpace();

            if (await this.stream.peek(1) === ']') {
                break;
            }
        }

        if (await this.stream.read(1) !== ']') {
            throw new Error('Invalid array');
        }

        return new PrimitiveArray(array);
    }

    private async readDict(): Promise<PrimitiveDictionary> {
        const object: Record<string, Primitive> = {};

        while (!this.stream.eof()) {
            await this.seekSpace();
            const key = await this.readName();
            await this.seekSpace();
            const value = await this.readObject();
            await this.seekSpace();

            object[key.getValue()] = value;

            const p = await this.stream.peek(2);
            if (p === '>>') {
                break;
            }
        }

        await this.seekSpace();

        if (await this.stream.read(2) !== '>>') {
            throw new Error('Invalid dict');
        }

        return new PrimitiveDictionary(object);
    }

    private async readStream(dict: PrimitiveDictionary): Promise<PrimitiveStream> {
        const streamDict = new StreamDictionary(dict);

        await this.stream.read(6); // stream keyword
        const start = this.stream.currentPosition();
        const end = this.stream.seekRelative(streamDict.Length.getValue());

        return new PrimitiveStream(streamDict, start, end);
    }

    private async readComment(): Promise<string> {
        if (await this.stream.peek(1) !== '%') {
            return '';
        }

        const string = await this.readUntil(this.WHITESPACES);

        return string.substring(1);
    }

    private async readUntil(chars: string[]): Promise<string> {
        let string = '';
        while (!this.stream.eof()) {
            const char = await this.stream.read(1);
            if (chars.includes(char)) {
                return string;
            }

            string += char;
        }

        return string;
    }

    private async readReverseUntil(chars: string[]): Promise<string> {
        let string = '';
        while (this.stream.currentPosition() > 0) {
            const char = await this.stream.read(-1);
            if (chars.includes(char)) {
                return string;
            }

            string = char + string;
        }

        return string;
    }

    private async readLastLine(until: number): Promise<string> {
        this.stream.seekEnd();

        return await this.readReverseUntil(this.WHITESPACES);
    }

    private async seekSpace(): Promise<void> {
        while (!this.stream.eof()) {
            if (this.WHITESPACES.includes(await this.stream.peek(1))) {
                await this.stream.read(1);
            } else {
                break;
            }
        }
    }
}
