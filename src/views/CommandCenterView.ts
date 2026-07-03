import { ItemView, WorkspaceLeaf } from 'obsidian';
import { h, render } from 'preact';
import { App } from '../App';

export const VIEW_TYPE_COMMAND_CENTER = 'alan-command-center-view';

export class CommandCenterView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_COMMAND_CENTER;
  }

  getDisplayText(): string {
    return 'Command Center';
  }

  getIcon(): string {
    return 'layout-dashboard';
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('command-center-view');
    render(h(App, { app: this.app }), container);
  }

  async onClose() {
    const container = this.containerEl.children[1] as HTMLElement;
    render(null, container);
  }
}
