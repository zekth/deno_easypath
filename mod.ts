import { join } from "https://deno.land/std/fs/path/mod.ts";
import { walk } from "https://deno.land/std/fs/walk.ts";

export interface CopyOption {
  to?: string;
  into?: string;
}
export class Path {
  private path: string;
  private queue: Promise<void>[];
  private encoder: TextEncoder = new TextEncoder();
  static home = new Path("~");
  static root = new Path("/");
  constructor(path: string) {
    this.path = path;
    this.queue = [];
    return this;
  }
  public toString(): string {
    return this.path;
  }
  mkdir(): Path {
    this.queue.push(Deno.mkdir(this.path, true));
    return this;
  }
  join(path: string): Path {
    this.path = join(this.path, path);
    return this;
  }
  copy(opt: CopyOption): Path {
    console.log(`copy:${opt}`);
    return this;
  }
  touch(): Path {
    this.queue.push(Deno.writeFile(this.path, this.encoder.encode("")));
    return this;
  }
  chmod(mode: number): Path {
    this.queue.push(Deno.chmod(this.path, mode));
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
