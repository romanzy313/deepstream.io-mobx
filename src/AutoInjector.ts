import { DeepstreamClient } from '@deepstream/client';

export class AutoInjector {
  static client?: DeepstreamClient;

  // public static get() {
  //   if (!this.client)
  //     throw new Error("");
  // }

  public static disable() {
    this.client = undefined;
  }

  public static enable(client: DeepstreamClient) {
    if (this.client)
      throw new Error('autoInject only allows one instance of the client!');

    this.client = client;
  }
}

export const getClientOrAutoinject = (path: string, opts: any) => {
  if ('client' in opts) {
    return opts.client;
  }
  //try injecting
  if (!AutoInjector.client) {
    throw new Error(
      `[${path}] unable to AutoInject. Did you pass autoInject to DsClientInstance constructor?`
    );
  }
  return AutoInjector.client;
};
