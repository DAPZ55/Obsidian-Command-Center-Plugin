import { App, PluginSettingTab, Setting } from 'obsidian';
import type AlanCommandCenterPlugin from '../main';
import { fetchCourses } from './api';
import type { CanvasCourse } from './types';

export interface SelectedCourse {
  id: string;
  name: string;
}

export interface PluginSettings {
  baseUrl: string;
  token: string;
  selectedCourses: SelectedCourse[];
  goalsByCourseId: Record<string, number>;
  newsTopic: string;
}

export const DEFAULT_PLUGIN_SETTINGS: PluginSettings = {
  baseUrl: '',
  token: '',
  selectedCourses: [],
  goalsByCourseId: {},
  newsTopic: 'technology',
};

export class CanvasSettingTab extends PluginSettingTab {
  plugin: AlanCommandCenterPlugin;

  constructor(app: App, plugin: AlanCommandCenterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Canvas base URL')
      .setDesc('e.g. https://yourschool.instructure.com')
      .addText((text) =>
        text.setValue(this.plugin.settings.baseUrl).onChange(async (value) => {
          this.plugin.settings.baseUrl = value.trim().replace(/\/$/, '');
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Canvas access token')
      .setDesc('Generate under Canvas -> Account -> Settings -> New Access Token')
      .addText((text) => {
        text.inputEl.type = 'password';
        text.setValue(this.plugin.settings.token).onChange(async (value) => {
          this.plugin.settings.token = value.trim();
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Courses to track')
      .setDesc('Fetch your active courses, then toggle which ones show up in the Canvas tab')
      .addButton((button) =>
        button.setButtonText('Fetch courses').onClick(async () => {
          await this.renderCoursePicker(courseListEl);
        })
      );

    const courseListEl = containerEl.createDiv();
  }

  async renderCoursePicker(courseListEl: HTMLElement): Promise<void> {
    courseListEl.empty();

    let courses: CanvasCourse[];
    try {
      courses = await fetchCourses(this.plugin.settings.baseUrl, this.plugin.settings.token);
    } catch (e) {
      new Setting(courseListEl).setDesc(
        `Couldn't fetch courses: ${e instanceof Error ? e.message : String(e)}`
      );
      return;
    }

    for (const course of courses) {
      const idStr = String(course.id);
      new Setting(courseListEl)
        .setName(course.name)
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.selectedCourses.some((c) => c.id === idStr))
            .onChange(async (value) => {
              if (value && !this.plugin.settings.selectedCourses.some((c) => c.id === idStr)) {
                this.plugin.settings.selectedCourses.push({ id: idStr, name: course.name });
              } else {
                this.plugin.settings.selectedCourses = this.plugin.settings.selectedCourses.filter(
                  (c) => c.id !== idStr
                );
              }
              await this.plugin.saveSettings();
            })
        );
    }
  }
}
