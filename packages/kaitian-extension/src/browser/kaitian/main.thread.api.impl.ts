import { IRPCProtocol } from '@ali/ide-connection';
import { Injector, Injectable } from '@ali/common-di';
import { MainThreaLifeCycle } from './main.thread.lifecycle';
import { MainThreadKaitianAPIIdentifier } from '../../common/kaitian';
import { MainThreaLayout } from './main.thread.layout';

export function createKaitianApiFactory(
  rpcProtocol: IRPCProtocol,
  injector: Injector,
) {
  const lifeCycle = injector.get(MainThreaLifeCycle, [rpcProtocol, injector]);
  const layout = injector.get(MainThreaLayout, [rpcProtocol, injector]);

  rpcProtocol.set(MainThreadKaitianAPIIdentifier.MainThreadLifecycle, lifeCycle);
  rpcProtocol.set(MainThreadKaitianAPIIdentifier.MainThreadLayout, layout);
  return () => {
    // do dispose
  };
}
