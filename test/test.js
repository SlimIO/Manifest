// Require Third-party Dependencies
const avaTest = require("ava");
const Manifest = require("../");

const {
    unlink,
    readFile
} = require("fs").promises;
const { join } = require("path");

avaTest("constructor: TypeError filePath", (assert) => {
    assert.throws(() => {
        new Manifest(10);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(true);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        new Manifest([]);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        new Manifest({});
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });
});

avaTest("constructor: Error filePath", (assert) => {
    assert.throws(() => {
        new Manifest("foo");
    }, { instanceOf: Error, message: "filePath param must ba an absolute path" });

});

avaTest("Create default", async(assert) => {
    const pathFile = join(__dirname, "default.toml");
    const defaultCreate = `name = "project"
version = "1.0.0"
project_type = "Addon"

[dependencies]
Events = "1.0.0"

[psp]
param = false

[build]
treeshake = true
removeComment = false
`;

    const mani = new Manifest(pathFile);
    await mani.create();

    const readed = await readFile(pathFile, { encoding: "utf-8" });
    assert.is(readed, defaultCreate);

    await unlink(pathFile);
});

avaTest("Create non default", async(assert) => {
    const pathFile = join(__dirname, "nonDefault.toml");
    const expected = `foo = "bar"

[obj]
bar = 10
`;

    const mani = new Manifest(pathFile);
    await mani.create({
        foo: "bar",
        obj: {
            bar: 10
        }
    });

    const readed = await readFile(pathFile, { encoding: "utf-8" });
    assert.is(readed, expected);

    await unlink(pathFile);
});

avaTest("Update with undefined", async(assert) => {
    const pathFile = join(__dirname, "updateUndefined.toml");
    const defaultCreate = `name = "project"
version = "1.0.0"
project_type = "Addon"

[dependencies]
Events = "1.0.0"

[build]
treeshake = true
removeComment = false
`;

    const mani = new Manifest(pathFile);
    await mani.create();
    await mani.update({ psp: undefined });

    const readed = await readFile(pathFile, { encoding: "utf-8" });
    assert.is(readed, defaultCreate);

    await unlink(pathFile);
});

avaTest("read", async(assert) => {
    const pathFile = join(__dirname, "slimio.toml");

    const mani = new Manifest(pathFile);
    const toml = await mani.read();

    const expected = {
        abc: {
            foo: 123,
            bar: [1, 2, 3]
        }
    };
    assert.deepEqual(toml, expected);
});
