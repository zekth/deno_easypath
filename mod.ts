import { join } from "https://deno.land/std/fs/path/mod.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";

export interface CopyOption {
  to?: string;
  into?: string;
}
export interface EasyPathOpt {
  path: string;
  async?: boolean;
}
export class EasyPath {
  private path: string;
  private async: boolean;
  private queue: Array<Promise<void>>;
  private encoder: TextEncoder = new TextEncoder();

  static home = new EasyPath({ path: "~" });
  static root = new EasyPath({ path: "/" });

  constructor(opt: EasyPathOpt = { path: "./", async: false }) {
    this.path = opt.path;
    this.async = !!opt.async;
    this.queue = [];
    return this;
  }

  public toString(): string {
    return this.path;
  }

  mkdir(): EasyPath {
    if (this.async) {
      this.queue.push(Deno.mkdir(this.path, true));
    } else {
      Deno.mkdirSync(this.path, true);
    }
    return this;
  }

  join(path: string): EasyPath {
    this.path = join(this.path, path);
    return this;
  }

  copy(opt: CopyOption): EasyPath {
    if (this.async) {
      console.log(`copy:${opt}`);
    } else {
      console.log(`copySync:${opt}`);
    }
    return this;
  }

  touch(): EasyPath {
    if (this.async) {
      this.queue.push(Deno.writeFile(this.path, this.encoder.encode("")));
    } else {
      Deno.writeFileSync(this.path, this.encoder.encode(""));
    }
    return this;
  }

  chmod(mode: number): EasyPath {
    if (this.async) {
      this.queue.push(Deno.chmod(this.path, mode));
    } else {
      Deno.chmodSync(this.path, mode);
    }
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
