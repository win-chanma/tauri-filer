export class Terminal {
  options: Record<string, unknown> = {};
  cols = 80;
  rows = 24;
  open(_element: HTMLElement) {}
  write(_data: string) {}
  onData(_callback: (data: string) => void) {
    return { dispose: () => {} };
  }
  onResize(_callback: (size: { cols: number; rows: number }) => void) {
    return { dispose: () => {} };
  }
  loadAddon(_addon: unknown) {}
  dispose() {}
}
