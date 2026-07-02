import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CommandCenterView, VIEW_TYPE_COMMAND_CENTER } from './views/CommandCenterView';

export default class AlanCommandCenterPlugin extends Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_COMMAND_CENTER,
      (leaf: WorkspaceLeaf) => new CommandCenterView(leaf)
    );

    this.addRibbonIcon('layout-dashboard', 'Open Command Center', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'open-command-center',
      name: 'Open Command Center',
      callback: () => this.activateView(),
    });
  }

  onunload() {}

  async activateView() {
    const { workspace } = this.app;

    const existing = workspace.getLeavesOfType(VIEW_TYPE_COMMAND_CENTER)[0];
    if (existing) {
      workspace.setActiveLeaf(existing);
      return;
    }

    const leaf = workspace.getLeaf('tab');
    await leaf.setViewState({ type: VIEW_TYPE_COMMAND_CENTER, active: true });
    workspace.setActiveLeaf(leaf);
  }
}
