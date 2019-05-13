import { test, runIfMain } from "https://deno.land/std/testing/mod.ts";
import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";
import { join } from "https://deno.land/std/fs/path/mod.ts";

import { Path } from "./mod.ts";

const testRootPath = "./test_data";

async function wipeTestEnv() {
  if (await exists(testRootPath)) {
    await Deno.remove(testRootPath, { recursive: true });
  }
  await Deno.mkdir(testRootPath);
}

// test({
//   name: "ls",
//   async fn() {
//     const d = await new Path(testRootPath)
//       .join("sub1")
//       .join("sub2")
//       .join("sub3")
//       .join("sub4")
//       .join("sub5")
//       .mkdir();
//     const ls = await new Path(testRootPath).ls();
//     console.log(ls);
//     // await wipeTestEnv();
//   }
// });

test({
  name: "Join",
  async fn() {
    const d = await new Path(testRootPath)
      .join("sub1")
      .join("sub2")
      .join("sub3")
      .join("sub4")
      .join("sub5");
    assertEquals(
      d.toString(),
      join(testRootPath, "sub1", "sub2", "sub3", "sub4", "sub5")
    );
    // await wipeTestEnv();
  }
});

test({
  name: "Touch",
  async fn() {
    const d = await new Path(testRootPath).join("foo.ts").touch();
    assert(await exists(join(testRootPath, "foo.ts")));
    await wipeTestEnv();
  }
});

runIfMain(import.meta);
