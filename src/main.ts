import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CommandCenterView, VIEW_TYPE_COMMAND_CENTER } from './views/CommandCenterView';
import { CanvasSettingTab, DEFAULT_CANVAS_SETTINGS } from './canvas/settings';
import type { CanvasSettings } from './canvas/settings';

export default class AlanCommandCenterPlugin extends Plugin {
  settings: CanvasSettings = DEFAULT_CANVAS_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CanvasSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE_COMMAND_CENTER,
      (leaf: WorkspaceLeaf) => new CommandCenterView(leaf, this)
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

  async loadSettings() {
    this.settings = Object.assign(structuredClone(DEFAULT_CANVAS_SETTINGS), await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

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
