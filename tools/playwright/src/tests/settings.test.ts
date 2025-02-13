import path from 'path';

import { expect } from '@playwright/test';

import { OpenSumiApp } from '../app';
import { OpenSumiComponentEditor } from '../component-editor';
import { OPENSUMI_VIEW_CONTAINERS } from '../constans';
import { OpenSumiContextMenu } from '../context-menu';
import { OpenSumiExplorerView } from '../explorer-view';
import { keypressWithCmdCtrl } from '../utils';
import { OpenSumiWorkspace } from '../workspace';

import test, { page } from './hooks';

let app: OpenSumiApp;
let explorer: OpenSumiExplorerView;
let workspace: OpenSumiWorkspace;

test.describe('OpenSumi Shortcuts', () => {
  test.beforeAll(async () => {
    workspace = new OpenSumiWorkspace([path.resolve('./src/tests/workspaces/default')]);
    app = await OpenSumiApp.load(page, workspace);
    explorer = await app.open(OpenSumiExplorerView);
    explorer.initFileTreeView(workspace.workspace.displayName);
  });

  test.afterAll(() => {
    app.dispose();
  });

  const openSettingsView = async () => {
    const leftTabbar = await app.page.waitForSelector(`#${OPENSUMI_VIEW_CONTAINERS.LEFT_TABBAR}`);
    const settingsButton = await leftTabbar.$('[class*="titleActions___"] span');
    await settingsButton?.click();
    const menu = new OpenSumiContextMenu(app);
    await menu.clickMenuItem('Settings');
  };

  test('open Settings by keybinding', async () => {
    await explorer.fileTreeView.focus();
    await app.page.keyboard.press(keypressWithCmdCtrl(','), { delay: 200 });
    const editor = await app.openComponentEditor(
      OpenSumiComponentEditor,
      'pref:/',
      'Settings',
      "[class*='preferences___']",
    );
    expect(await editor.isVisible()).toBeTruthy();
    await editor.close();
    await app.page.waitForTimeout(1000);
    expect(await editor.isVisible()).toBeFalsy();
  });

  test('open Settings by settings button', async () => {
    await openSettingsView();
    const editor = await app.openComponentEditor(
      OpenSumiComponentEditor,
      'pref:/',
      'Settings',
      "[class*='preferences___']",
    );
    expect(await editor.isVisible()).toBeTruthy();
    await editor.close();
  });

  test('edit settings in settings.json', async () => {
    await openSettingsView();
    const editor = await app.openComponentEditor(
      OpenSumiComponentEditor,
      'pref:/',
      'Settings',
      "[class*='preferences___']",
    );
    expect(await editor.isVisible()).toBeTruthy();
    // Settings => Feature => Search > Include
    const tabs = (await (await editor.getContainer())?.$$('[class*="index_item_wrapper__"]')) || [];
    let featrueTab;
    for (const tab of tabs) {
      const title = await tab.textContent();
      if (title === 'Feature') {
        featrueTab = tab;
        break;
      }
    }
    await featrueTab.click();
    await app.page.waitForTimeout(1000);
    const items = (await (await editor.getContainer())?.$$('[class*="preference_item___"]')) || [];
    let searchIncludeItem;
    for (const item of items) {
      const key = await (await item.$('[class*="key___"]'))?.textContent();
      if (key === 'Search > Include ') {
        searchIncludeItem = item;
        break;
      }
    }
    const editButton = await searchIncludeItem.$('[class*="control_wrap___"] a');
    expect(editButton).toBeDefined();
    await editButton.click();
    await app.page.waitForTimeout(2000);
    const currentTab = await editor.getCurrentTab();
    expect(await currentTab?.textContent()).toBe(' settings.json');
  });
});
