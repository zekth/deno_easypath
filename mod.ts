import { join } from "https://deno.land/std/fs/path/mod.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";

export interface CopyOption {
  to?: string;
  into?: string;
}

export class EasyPath {
  private path: string;
  private queue: Array<Promise<void>>;
  private encoder: TextEncoder = new TextEncoder();

  static home = new EasyPath("~");
  static root = new EasyPath("/");

  constructor(path: string = "./") {
    this.path = path;
    this.queue = [];
    return this;
  }
  public toString(): string {
    return this.path;
  }
  mkdir(): EasyPath {
    this.queue.push(Deno.mkdir(this.path, true));
    return this;
  }
  mkdirSync(): EasyPath {
    Deno.mkdirSync(this.path, true);
    return this;
  }
  join(path: string): EasyPath {
    this.path = join(this.path, path);
    return this;
  }
  copy(opt: CopyOption): EasyPath {
    console.log(`copy:${opt}`);
    return this;
  }
  copySync(opt: CopyOption): EasyPath {
    return this;
  }
  touch(): EasyPath {
    this.queue.push(Deno.writeFile(this.path, this.encoder.encode("")));
    return this;
  }
  touchSync(): EasyPath {
    Deno.writeFileSync(this.path, this.encoder.encode(""));
    return this;
  }
  chmod(mode: number): EasyPath {
    this.queue.push(Deno.chmod(this.path, mode));
    return this;
  }
  chmodSync(mode: number): EasyPath {
    Deno.chmodSync(this.path, mode);
    return this;
  }
  async ls(): Promise<string[]> {
    const arr = [];
    for await (const f of walk(this.path)) {
      arr.push(f.path.replace(/\\/g, "/"));
    }
    arr.sort();
    return arr;
  }
  async exec(): Promise<void> {
    for (const p in this.queue) {
      await p;
    }
    this.queue = [];
  }
}
