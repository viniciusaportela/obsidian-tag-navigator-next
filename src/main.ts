import { App, Plugin, WorkspaceLeaf } from "obsidian";

import { VIEW_TYPE } from "./constants";
import CRNView from "./view";
import {
  createSettingsStore,
  createTagMenuStore,
  SettingsStore,
  TagMenuStore,
} from "./ui/stores";

declare global {
  interface Window {
    app: App;
  }
}

export default class CrossNavPlugin extends Plugin {
  public settingsStore: SettingsStore;
  public tagMenuStore: TagMenuStore;

  async onload(): Promise<void> {
    this.settingsStore = await createSettingsStore(this);
    this.tagMenuStore = createTagMenuStore(this.settingsStore);

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new CRNView(leaf, this.settingsStore, this.tagMenuStore)
    );

    this.addRibbonIcon("tag", "Tag Navigator", () => {
      this.openTagNavigatorView();
    });

    this.addCommand({
      id: "show-refnav-view",
      name: "Open Tag Navigator",
      callback: () => {
        this.openTagNavigatorView();
      },
    });
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);

    this.tagMenuStore.destroy();
  }

  async openTagNavigatorView(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);

    await this.app.workspace.getLeaf(true).setViewState({
      type: VIEW_TYPE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
    );
  }
}
