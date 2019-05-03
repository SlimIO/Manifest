declare class Manifest {
    constructor(payload: Manifest.Payload);

    // Properties
    readonly name: string;
    readonly version: string;
    readonly type: Manifest.Type;
    readonly dependencies: Manifest.Dependencies;
    readonly doc: Manifest.Documentation;
    readonly psp: Manifest.psp;
    public static DEFAULT_FILE: string;
    public static TYPES: Readonly<Set<string>>
    public static DEFAULT_DOC_PORT: number;

    // Methods
    static create(config?: Manifest.Payload, filePath?: string, lightMode?: boolean): Manifest;
    static open(filePath?: string): Manifest;
    static writeOnDisk(manifest: Manifest, filePath?: string): void;
    public addDependency(name: string, version: string): void;
    public hasDependency(name: string): boolean;
    public toJSON(): Manifest.Payload;
}

declare namespace Manifest {
    type Type = "Addon" | "NAPI" | "CLI" | "Package";

    interface psp {
        npmrc: boolean;
        jsdoc: boolean;
    }

    interface Documentation {
        include: string[];
        port: number;
    }

    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: Type;
        dependencies?: Dependencies;
        doc?: {
            include?: string[];
            port?: number;
        }
    }
}

export as namespace Manifest;
export = Manifest;
