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
    static create(obj?: object): Manifest;
    static read(filePath: string): Manifest;
    static writeOnDisk(filePath: string, manifest: Manifest): void;
    public toJSON(): Object;
}

export as namespace Manifest;
export = Manifest;