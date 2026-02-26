export class WebglAddon {
  onContextLoss() {
    return { dispose: () => {} };
  }
  dispose() {}
}
