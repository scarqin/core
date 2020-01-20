import * as React from 'react';
import * as clsx from 'classnames';
import * as styles from './styles.module.less';
import { INJECTOR_TOKEN, Injector } from '@ali/common-di';
import { ComponentRegistryInfo, useInjectable, ComponentRenderer, ConfigProvider, AppConfig, localize, getIcon, CommandService } from '@ali/ide-core-browser';
import { TabbarService, TabbarServiceFactory } from './tabbar.service';
import { observer } from 'mobx-react-lite';
import { TabbarConfig } from './renderer.view';
import { AccordionContainer } from '../accordion/accordion.view';
import { InlineActionBar, InlineMenuBar } from '@ali/ide-core-browser/lib/components/actions';
import { IMenu } from '@ali/ide-core-browser/lib/menu/next';
import { TitleBar } from '../accordion/titlebar.view';
import { AccordionServiceFactory, AccordionService } from '../accordion/accordion.service';

export const BaseTabPanelView: React.FC<{
  PanelView: React.FC<{ component: ComponentRegistryInfo, side: string, titleMenu: IMenu }>;
}> = observer(({ PanelView }) => {
  const { side } = React.useContext(TabbarConfig);
  const tabbarService: TabbarService = useInjectable(TabbarServiceFactory)(side);
  const { currentContainerId } = tabbarService;
  const panelVisible = { zIndex: 1, display: 'block' };
  const panelInVisible = { zIndex: -1, display: 'none' };
  return (
    <div className={styles.tab_panel}>
      {tabbarService.visibleContainers.map((component) => {
        const containerId = component.options!.containerId;
        const titleMenu = tabbarService.getTitleToolbarMenu(containerId);
        return <div key={containerId} className={clsx(styles.panel_wrap)} style={currentContainerId === containerId ? panelVisible : panelInVisible}>
          <PanelView titleMenu={titleMenu} side={side} component={component} />
        </div>;
      })}
    </div>
  );
});

const ContainerView: React.FC<{
  component: ComponentRegistryInfo;
  side: string;
  titleMenu: IMenu;
}> = (({ component, titleMenu }) => {
  const ref = React.useRef<HTMLElement | null>();
  const configContext = useInjectable<AppConfig>(AppConfig);
  const { title, titleComponent, component: CustomComponent, containerId } = component.options!;
  const injector: Injector = useInjectable(INJECTOR_TOKEN);
  const handleContextMenu = (e: React.MouseEvent) => {
    const accordionService: AccordionService = injector.get(AccordionServiceFactory)(containerId);
    accordionService.handleContextMenu(e);
  };

  return (
    <div className={styles.view_container}>
      {!CustomComponent && <div onContextMenu={handleContextMenu} className={styles.panel_titlebar}>
        <TitleBar
          title={title!}
          menubar={<InlineActionBar menus={titleMenu} />}
        />
        {titleComponent && <div className={styles.panel_component}>
          <ConfigProvider value={configContext} >
            <ComponentRenderer Component={titleComponent} />
          </ConfigProvider>
        </div>}
      </div>}
      <div className={styles.container_wrap} ref={(ele) => ref.current = ele}>
        {CustomComponent ? <ConfigProvider value={configContext} >
          <ComponentRenderer initialProps={component.options && component.options.initialProps} Component={CustomComponent} />
        </ConfigProvider> : <AccordionContainer views={component.views} containerId={component.options!.containerId} />}
      </div>
    </div>
  );
});

const PanelView: React.FC<{
  component: ComponentRegistryInfo;
  side: string;
  titleMenu: IMenu;
}> = (({ component, titleMenu, side }) => {
  const contentRef = React.useRef<HTMLDivElement | null>();
  const titleComponent = component.options && component.options.titleComponent;

  return (
    <div className={styles.panel_container} ref={(ele) =>  contentRef.current = ele}>
      <div className={styles.float_container}>
        {titleComponent && <div className={styles.toolbar_container}>
          <ComponentRenderer Component={titleComponent} />
        </div>}
        <div className='toolbar_container'>
          {titleMenu && <InlineActionBar menus={titleMenu} />}
        </div>
      </div>
      <ComponentRenderer initialProps={component.options && component.options.initialProps} Component={component.views[0].component || component.options!.component!} />
    </div>
  );
});

const NextPanelView: React.FC<{
  component: ComponentRegistryInfo;
  side: string;
  titleMenu: IMenu;
}> = (({ component, titleMenu, side }) => {
  const contentRef = React.useRef<HTMLDivElement | null>();
  const titleComponent = component.options && component.options.titleComponent;
  const tabbarService: TabbarService = useInjectable(TabbarServiceFactory)(side);

  return (
    <div className={styles.panel_container} ref={(ele) =>  contentRef.current = ele}>
      <div className={styles.panel_title_bar}>
        <h1>{component.options!.title}</h1>
        <div className={styles.title_component_container}>
          {titleComponent && <ComponentRenderer Component={titleComponent} />}
        </div>
        <div className={styles.panel_toolbar_container}>
          { titleMenu && <InlineActionBar menus={titleMenu} /> }
          <InlineMenuBar menus={tabbarService.commonTitleMenu} moreAtFirst />
        </div>
      </div>
      <div className={styles.panel_wrapper}>
        <ComponentRenderer initialProps={component.options && component.options.initialProps} Component={component.views[0].component!} />
      </div>
    </div>
  );
});

export const RightTabPanelRenderer: React.FC = () => <BaseTabPanelView PanelView={ContainerView} />;

export const LeftTabPanelRenderer: React.FC = () => <BaseTabPanelView PanelView={ContainerView} />;

export const BottomTabPanelRenderer: React.FC = () => <BaseTabPanelView PanelView={PanelView} />;

export const NextBottomTabPanelRenderer: React.FC = () => <BaseTabPanelView PanelView={NextPanelView} />;
