/// <reference types="@types/node" />


declare class Manifest {
    // Constructor
    constructor(obj: Object);

    // Properties
    readonly name: string;
    readonly version: string;
    readonly projectType: String;
    readonly dependencies: Object;

    // Methods
    static create(obj?: DefaultConfig): Manifest;
    static read(filePath: string): Manifest;
    static writeOnDisk(filePath: string, manifest: Manifest): void;
    public toJSON(): DefaultConfig;
}

declare namespace Manifest {
    interface DefaultConfig {
        name: string;
        version: string;
        project_type: string;
        dependencies: object;
    }
}

export as namespace Manifest;
export = Manifest;