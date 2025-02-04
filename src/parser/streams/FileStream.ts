import {type FileHandle, open, stat} from 'fs/promises';
import {Stream} from './Stream';

export class FileStream extends Stream {
    private constructor(
        private readonly file: FileHandle,
        private readonly length: number,
    ) {
        super();
    }

    public static async createFromFilePath(filePath: string) {
        return new FileStream(
            await open(filePath, 'r'),
            (await stat(filePath)).size,
        );
    }

    public override async peek(numberOfCharacters: number): Promise<string> {
        const length = Math.abs(numberOfCharacters);

        if (numberOfCharacters < 0) {
            const {bytesRead, buffer} = await this.file.read(
                Buffer.alloc(length, ''),
                0,
                length,
                this.position - length,
            );
            if (bytesRead !== length) {
                throw new Error('Diff');
            }
            return buffer.toString();
        } else {
            const {bytesRead, buffer} = await this.file.read(
                Buffer.alloc(length, ''),
                0,
                numberOfCharacters,
                this.position,
            );
            if (bytesRead !== length) {
                throw new Error('Diff');
            }
            return buffer.toString();
        }
    }

    public override seekEnd() {
        this.position = this.length;

        return this.position;
    }

    public override eof(): boolean {
        return this.position === this.length;
    }
}
