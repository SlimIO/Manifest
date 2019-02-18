/// <reference types="@types/node" />

declare class Manifest {
    // Constructor
    constructor(filePath: string);

    // Properties
    public filePath: string;

    // Methods
    public create(tomlObj: object): Promise;
    public update(updateObj: object): Promise;
    public read(): string;
}

export as namespace Manifest;
export = Manifest;