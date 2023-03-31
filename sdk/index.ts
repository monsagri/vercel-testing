import { EdgeConfigClient } from '@vercel/edge-config';
import { init as ldInit, LDClient, LDContext, LDFlagsState, LDFlagsStateOptions, LDFlagValue, LDOptions } from '@launchdarkly/node-server-sdk';
import configuration from './configuration';

interface InitParams {
  edgeSDK: EdgeConfigClient;
  sdkKey: string;
  originalConfig: LDOptions; 
}

type Callback = (err: any, res: LDFlagValue) => void

const init = ({edgeSDK, sdkKey, originalConfig = {}}: InitParams) => {
  console.log('initing the sdk')
  const config = configuration.validate(edgeSDK, sdkKey, originalConfig);
  const ldClient = ldInit('none', config);
  // TODO: type this
  interface Client {
    [key: string]: any
}
  const client: Client = {};

  client.variation = (key: string, context: LDContext, defaultValue: LDFlagValue, callback?: Callback): Promise<any> => ldClient.variation(key, context, defaultValue, callback);

  client.variationDetail = (key: string, context: LDContext, defaultValue: LDFlagValue, callback?: Callback): Promise<any> => ldClient.variationDetail(key, context, defaultValue, callback);

  client.allFlagsState = (context: LDContext, options: LDFlagsStateOptions, callback?: Callback): Promise<LDFlagsState> => ldClient.allFlagsState(context, options, callback);

  client.waitForInitialization = () => ldClient.waitForInitialization();

  return client;
};

export {
  init,
};
