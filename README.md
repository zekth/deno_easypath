# Deno_easyPath [![Build Status](https://travis-ci.org/zekth/deno_easypath.svg?branch=master)](https://travis-ci.org/zekth/deno_easypath)

## Usage

```ts
import { EasyPath } from "./mod.ts";

new EasyPath()
  .join("foo")
  .join("bar.ts")
  .toString(); // output foo/bar.ts

new EasyPath()
  .join("bar.ts")
  .touch()
  .execSync(); // create ./bar.ts Synchronously

const e = new EasyPath().join("bar.ts").touch();
await e.exec(); // create ./bar.ts Asynchronously

// you can also chain actions
new EasyPath()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch()
  .execSync(); // create ./subFolder/bar.ts Synchronously

const e = new EasyPath()
  .join("subFolder")
  .mkdir()
  .join("foo.ts")
  .touch();
await e.exec(); // create ./subFolder/bar.ts Asynchronously

// Dynamic getters
EasyPath.home.foo.bar.bur.bor.toString();
// output ~\foo\bar\bur\bor
```
