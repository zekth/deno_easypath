# Deno_easyPath [![Build Status](https://travis-ci.org/zekth/deno_easypath.svg?branch=master)](https://travis-ci.org/zekth/deno_easypath)

Path wrapper to manipulate Filesystem using [Deno](https://github.com/denoland/deno). Mostly inspired by [Path.swift](https://github.com/mxcl/Path.swift)

## Usage

```ts
import { path } from "./mod.ts";

path("/")
  .join("foo")
  .join("bar.ts")
  .toString(); // output /foo/bar.ts

path()
  .join("bar.ts")
  .touch()
  .execSync(); // create ./bar.ts Synchronously

const e = path()
  .join("bar.ts")
  .touch();
await e.exec(); // create ./bar.ts Asynchronously

// you can also chain actions
path()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch()
  .execSync(); // create ./subFolder/bar.ts Synchronously

const e = path()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch();
await e.exec(); // create ./subFolder/bar.ts Asynchronously

// Dynamic getters
EasyPath.home.foo.bar.bur.bor.toString();
// output ~\foo\bar\bur\bor

path()
  .join("foo.ts")
  .copy({ to: path(testRootPath).join("bar.ts") })
  .execSync();
// Will copy ./foo.ts to ./bar.ts

path()
  .join("foo.ts")
  .copy({ into: path(testRootPath).join("sub") })
  .execSync();
// Will copy ./foo.ts to ./sub/bar.ts

// copy accept also EasyPath chains.
path(testRootPath)
  .join("foo.ts")
  .copy({
    into: path(testRootPath)
      .join("sub")
      .mkdir()
  })
  .execSync();
// Will copy ./foo.ts to ./sub/bar.ts
// Note chains in the copy args are executed synchronously
```

## TODO

- Add symlink resolution
- Improve doc
