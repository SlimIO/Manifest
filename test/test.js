// Require Third-party Dependencies
const avaTest = require("ava");
const Manifest = require("../");

const { unlink, access } = require("fs").promises;
const { join } = require("path");

const Types = new Set(["Addon", "NAPI", "CLI"]);
const VALID_OBJ = {
    name: "My project",
    version: "7.7.7",
    type: "Addon",
    dependencies: {
        Event: "1.1.1"
    }
};

function modifValidobj(obj) {
    return Object.assign({}, VALID_OBJ, obj);
}

avaTest("private attribute", async(assert) => {
    const manifest = Manifest.create();
    const Mani = class Manifest {};
    assert.deepEqual(manifest, new Mani());
    assert.is(Object.keys(manifest).length, 0);
    assert.is(Reflect.ownKeys(manifest).length, 4);
});

avaTest("constructor: payload param must be a typeof <object>", (assert) => {
    assert.throws(() => {
        new Manifest();
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(10);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(true);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });

    assert.throws(() => {
        new Manifest([]);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(null);
    }, { instanceOf: TypeError, message: "payload param must be a typeof <object>" });
});

avaTest("constructor: payload.name must be a typeof <string>", (assert) => {
    assert.throws(() => {
        new Manifest({});
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ name: 10 }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ name: true }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ name: [] }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ name: {} }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ name: null }));
    }, { instanceOf: TypeError, message: "payload.name must be a typeof <string>" });
});

avaTest("constructor: payload.version must be a valid semver", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ version: 10 }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ version: true }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ version: "foo" }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ version: [] }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ version: {} }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ version: null }));
    }, { instanceOf: Error, message: "payload.version must be a valid semver" });
});

avaTest(`constructor: payload.type must be one <string> of the Set : ${[...Types]}`, (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ type: 10 }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });

    assert.throws(() => {
        new Manifest(modifValidobj({ type: true }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });

    assert.throws(() => {
        new Manifest(modifValidobj({ type: "foo" }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });

    assert.throws(() => {
        new Manifest(modifValidobj({ type: [] }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });

    assert.throws(() => {
        new Manifest(modifValidobj({ type: {} }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });

    assert.throws(() => {
        new Manifest(modifValidobj({ type: null }));
    }, { instanceOf: TypeError, message: `payload.type must be one <string> of the Set : ${[...Types]}` });
});

avaTest("constructor: payload.dependencies must be a typeof <object>", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: 10 }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: true }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: "foo" }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: [] }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: null }));
    }, { instanceOf: TypeError, message: "payload.dependencies must be a typeof <object>" });
});

avaTest("constructor: payload.dependencies.key must be a valid semver", (assert) => {
    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: 10 } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: true } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: "foo" } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: [] } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });

    assert.throws(() => {
        new Manifest(modifValidobj({ dependencies: { abc: null } }));
    }, { instanceOf: Error, message: "payload.dependencies.abc must be a valid semver" });
});

avaTest("read: filePath param must be a typeof <string>", (assert) => {
    assert.throws(() => {
        Manifest.read();
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.read(10);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.read(true);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.read([]);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.read({});
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.read(null);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });
});

avaTest("read: filePath param must ba an absolute path", (assert) => {
    assert.throws(() => {
        Manifest.read("foo");
    }, { instanceOf: Error, message: "filePath param must ba an absolute path" });
});

avaTest("read: extension file must be a .toml", (assert) => {
    assert.throws(() => {
        Manifest.read(join(__dirname, "slimio.txt"));
    }, { instanceOf: Error, message: "extension file must be a .toml" });
});

avaTest("read: slimio.toml", (assert) => {
    const manifest = Manifest.read(join(__dirname, "slimio.toml"));
    assert.is(manifest.name, "read test");
    assert.is(manifest.version, "0.1.0");
    assert.is(manifest.type, "CLI");
    assert.is(manifest.dependencies, undefined);
});

avaTest("create: default", (assert) => {
    const manifest = Manifest.create();
    assert.is(manifest.name, "project");
    assert.is(manifest.version, "1.0.0");
    assert.is(manifest.type, "Addon");
    assert.deepEqual(manifest.dependencies, {});
});

avaTest("create: with full obj", (assert) => {
    const manifest = Manifest.create({
        name: "created",
        version: "2.2.2",
        type: "NAPI",
        dependencies: {
            Event: "1.2.3",
            Alerting: "4.5.6"
        }
    });

    assert.is(manifest.name, "created");
    assert.is(manifest.version, "2.2.2");
    assert.is(manifest.type, "NAPI");
    assert.deepEqual(manifest.dependencies, {
        Event: "1.2.3",
        Alerting: "4.5.6"
    });
});

avaTest("writeOnDisk: filePath param must be a typeof <string>", (assert) => {
    const manifest = Manifest.create();

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, 10);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, true);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, []);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, {});
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, null);
    }, { instanceOf: TypeError, message: "filePath param must be a typeof <string>" });
});

avaTest("writeOnDisk: filePath param must ba an absolute path", (assert) => {
    const manifest = Manifest.create();

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, "foo");
    }, { instanceOf: Error, message: "filePath param must ba an absolute path" });
});

avaTest("writeOnDisk: not toml file", (assert) => {
    const manifest = Manifest.create();

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, join(__dirname, "slimio.txt"));
    }, { instanceOf: Error, message: "extension file must be a .toml" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, join(__dirname, "slimio."));
    }, { instanceOf: Error, message: "extension file must be a .toml" });

    assert.throws(() => {
        Manifest.writeOnDisk(manifest, join(__dirname, "slimio"));
    }, { instanceOf: Error, message: "extension file must be a .toml" });
});


avaTest("writeOnDisk: file already exist", async(assert) => {
    const filePath = join(__dirname, "slimio.toml");
    await access(filePath);

    const manifest = Manifest.create();
    Manifest.writeOnDisk(manifest, filePath);

    const manifestRead = Manifest.read(filePath);
    assert.is(manifestRead.name, "read test");
    assert.is(manifestRead.version, "0.1.0");
    assert.is(manifestRead.type, "CLI");
    assert.is(manifestRead.dependencies, undefined);
});


avaTest("writeOnDisk: file doesn't exist", async(assert) => {
    const filePath = join(__dirname, "slimioWriteOnDisk.toml");
    await assert.throwsAsync(async() => {
        await access(filePath);
    }, { instanceOf: Error, code: "ENOENT" });

    const manifest = Manifest.create();
    Manifest.writeOnDisk(manifest, filePath);
    await access(filePath);

    const manifestRead = Manifest.read(filePath);
    assert.is(manifestRead.name, "project");
    assert.is(manifestRead.version, "1.0.0");
    assert.is(manifestRead.type, "Addon");
    assert.deepEqual(manifestRead.dependencies, {});

    await unlink(filePath);
});

