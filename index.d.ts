declare class Manifest {
    constructor(payload: Manifest.Payload);

    // Properties
    readonly name: string;
    readonly version: string;
    readonly type: Manifest.Type;
    readonly dependencies: Manifest.Dependencies;
    public static DEFAULT_FILE: string;
    public static TYPES: Readonly<Set<string>>

    // Methods
    static create(config?: Manifest.Payload, filePath?: string): Manifest;
    static open(filePath?: string): Manifest;
    static writeOnDisk(manifest: Manifest, filePath?: string): void;
    public addDependency(name: string, version: string): void;
    public hasDependency(name: string): boolean;
    public toJSON(): Manifest.Payload;
}

declare namespace Manifest {
    type Type = "Addon" | "NAPI" | "CLI";

    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: Type;
        dependencies?: Dependencies;
    }
}

export as namespace Manifest;
export = Manifest;
