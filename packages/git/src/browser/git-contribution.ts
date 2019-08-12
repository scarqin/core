import { Injectable, Autowired } from '@ali/common-di';
import { CommandContribution, CommandRegistry, Command } from '@ali/ide-core-common';
import { KeybindingContribution, KeybindingRegistry, Logger, ClientAppContribution } from '@ali/ide-core-browser';
import { Domain } from '@ali/ide-core-common/lib/di-helper';
import { MenuContribution, MenuModelRegistry } from '@ali/ide-core-common/lib/menu';
import { Git } from './git.view';
import { LayoutContribution, ComponentRegistry } from '@ali/ide-core-browser/lib/layout';

@Domain(ClientAppContribution, CommandContribution, KeybindingContribution, MenuContribution, LayoutContribution)
export class GitContribution implements CommandContribution, KeybindingContribution, MenuContribution, ClientAppContribution, LayoutContribution {
  @Autowired()
  logger: Logger;

  onStart() {

  }

  registerCommands(commands: CommandRegistry): void {
  }

  registerMenus(menus: MenuModelRegistry): void {

  }

  registerKeybindings(keybindings: KeybindingRegistry): void {
  }

  registerComponent(registry: ComponentRegistry) {
    registry.register('@ali/ide-git', {
      component: Git,
      iconClass: 'volans_icon git_icon',
      initialProps: {
        test: 'from props',
      },
      onActive: () => {
        console.log('on active');
      },
      onInActive: () => {
        console.log('on in active');
      },
      onCollapse: () => {
        console.log('on collapse');
      },
    });
  }
}
