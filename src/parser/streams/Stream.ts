export abstract class Stream {
    public position = 0;

    public currentPosition() {
        return this.position;
    }

    public async read(numberOfCharacters: number) {
        if (numberOfCharacters < 0) {
            this.position += numberOfCharacters;
        }
        const result = await this.peek(numberOfCharacters);

        if (numberOfCharacters > 0) {
            this.position += numberOfCharacters;
        }

        return result;
    };

    public seekAbsolute(position: number) {
        return this.position = position;
    };

    public seekRelative(numberOfCharacters: number) {
        return this.position + numberOfCharacters;
    };

    public abstract seekEnd(): number;

    public abstract peek(numberOfCharacters: number): Promise<string>;

    public abstract eof(): boolean;
}
