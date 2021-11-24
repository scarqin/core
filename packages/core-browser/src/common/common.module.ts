import { Injectable } from '@opensumi/di';
import { BrowserModule } from '../browser-module';
import { ClientCommonContribution } from './common.contribution';
import { OpenerContribution } from '../opener';
import { DefaultOpenerContribution, OpenerContributionClient } from '../opener/opener.contribution';
import { CommonServerPath, CryptrServicePath, KeytarServicePath } from '@opensumi/ide-core-common';
import { AuthenticationContribution } from '../authentication/authentication.contribution';
import { HashCalculateContribution } from '../hash-calculate/hash-calculate.contribution';

@Injectable()
export class ClientCommonModule extends BrowserModule {
  contributionProvider = [ OpenerContribution ];
  providers = [
    ClientCommonContribution,
    DefaultOpenerContribution,
    OpenerContributionClient,
    AuthenticationContribution,
    HashCalculateContribution,
  ];
  backServices = [
    {
      servicePath: CommonServerPath,
    },
    {
      servicePath: KeytarServicePath,
    },
    {
      servicePath: CryptrServicePath,
    },
  ];
}
