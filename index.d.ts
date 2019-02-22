/// <reference types="@types/node" />


declare class Manifest {
    // Constructor
    constructor(payload: Manifest.Payload);

    // Properties
    readonly name: string;
    readonly version: string;
    readonly type: String;
    readonly dependencies: Manifest.Dependencies;

    // Methods
    static create(config?: Manifest.Payload): Manifest;
    static read(filePath: string): Manifest;
    static writeOnDisk(manifest: Manifest, filePath?: string): void;
    public toJSON(): Manifest.Payload;
}

declare namespace Manifest {
    interface Dependencies {
        [name: string]: string;
    }

    interface Payload {
        name: string;
        version: string;
        type: string;
        dependencies?: Dependencies;
    }
}

export as namespace Manifest;
export = Manifest;