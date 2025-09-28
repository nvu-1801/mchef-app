type Dict = Record<string, string | null>;
export class MemoryStorage {
  private store: Dict = {};
  getItem = async (k: string) => this.store[k] ?? null;
  setItem = async (k: string, v: string) => { this.store[k] = v; };
  removeItem = async (k: string) => { delete this.store[k]; };
}
