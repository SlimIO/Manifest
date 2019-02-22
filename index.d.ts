/// <reference types="@types/node" />


declare class Manifest {
    // Constructor
    constructor(obj: Object);

    // Properties
    readonly name: string;
    readonly version: string;
    readonly type: String;
    readonly dependencies: Object;

    // Methods
    static create(obj?: DefaultConfig): Manifest;
    static read(filePath: string): Manifest;
    static writeOnDisk(manifest: Manifest, filePath?: string): void;
    public toJSON(): DefaultConfig;
}

declare namespace Manifest {
    interface DefaultConfig {
        name: string;
        version: string;
        type: string;
        dependencies?: object;
    }
}

export as namespace Manifest;
export = Manifest;