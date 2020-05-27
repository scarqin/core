import { Injectable, Autowired } from '@ali/common-di';
import { IRPCProtocol } from '@ali/ide-connection';
import { IconService } from '@ali/ide-theme/lib/browser';
import { IMainThreadLayout, IExtHostLayout } from '../../common/kaitian/layout';
import { IMainLayoutService, TabBarRegistrationEvent } from '@ali/ide-main-layout';
import { TabBarHandler } from '@ali/ide-main-layout/lib/browser/tabbar-handler';
import { ExtHostKaitianAPIIdentifier } from '../../common/kaitian';
import { IEventBus, Disposable, ILogger } from '@ali/ide-core-browser';
import { IconType, IconShape } from '@ali/ide-theme';

@Injectable({ multiple: true })
export class MainThreaLayout extends Disposable implements IMainThreadLayout {
  @Autowired(IMainLayoutService)
  layoutService: IMainLayoutService;

  @Autowired(IconService)
  private iconService: IconService;

  handlerMap = new Map<string, TabBarHandler>();

  proxy: IExtHostLayout;

  @Autowired(IEventBus)
  eventBus: IEventBus;

  @Autowired(ILogger)
  logger: ILogger;

  constructor(rpcProtocol: IRPCProtocol) {
    super();
    this.proxy = rpcProtocol.getProxy(ExtHostKaitianAPIIdentifier.ExtHostLayout);
  }

  $setTitle(id: string, title: string): void {
    this.getHandler(id).updateTitle(title);
  }

  $setIcon(id: string, iconPath: string): void {
    const iconClass = this.iconService.fromIcon('', iconPath, IconType.Background, IconShape.Square);
    this.getHandler(id).setIconClass(iconClass!);
  }

  $setSize(id: string, size: number): void {
    this.getHandler(id).setSize(size);
  }

  $activate(id: string): void {
    this.getHandler(id).activate();
  }

  $deactivate(id: string): void {
    this.getHandler(id).deactivate();
  }

  async $setVisible(id: string, visible: boolean) {
    if (visible) {
      this.getHandler(id).show();
    } else {
      if (this.getHandler(id).isActivated()) {
        this.getHandler(id).deactivate();
      }
      this.getHandler(id).hide();
    }
  }

  async $connectTabbar(id: string) {
    if (!this.handlerMap.has(id)) {
      const handle = this.layoutService.getTabbarHandler(id);
      if (handle) {
        this.bindHandleEvents(handle);
      } else {
        const disposer = this.eventBus.on(TabBarRegistrationEvent, (e) => {
          if (e.payload.tabBarId === id) {
            const handle = this.layoutService.getTabbarHandler(id);
            this.bindHandleEvents(handle!);
            disposer.dispose();
          }
        });
        this.addDispose(disposer);
      }
    }
  }

  private bindHandleEvents(handle: TabBarHandler) {
    this.handlerMap.set(handle.containerId, handle);
    handle.onActivate(() => {
      this.proxy.$acceptMessage(handle.containerId, 'activate');
    });
    handle.onInActivate(() => {
      this.proxy.$acceptMessage(handle.containerId, 'deactivate');
    });
  }

  protected getHandler(id: string) {
    const handler = this.layoutService.getTabbarHandler(id);
    if (!handler) {
      this.logger.warn(`MainThreaLayout:没有找到${id}对应的handler`);
    }
    return handler!;
  }

}
