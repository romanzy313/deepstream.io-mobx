// and does truly global state managemenet
import { makeAutoObservable, runInAction } from 'mobx';

import { DeepstreamClient } from '@deepstream/client';
import { JSONObject } from '@deepstream/client/src/constants';

export type DeepsteamClientOptions = ConstructorParameters<
  typeof DeepstreamClient
>[1];

export type ConnectionState =
  | 'OPEN'
  | 'CLOSED'
  | 'ERROR'
  | 'OFFLINE'
  | 'CONNECTING'
  | 'AUTHENTICATION';

export type DefaultLoginDetails = {
  username: string;
  password: string;
};

export class DsClientInstance<
  LoginDetails extends JSONObject = {},
  ClientData extends JSONObject = {}
> {
  _previouslyConnected = false;
  state: ConnectionState = 'CLOSED';
  isLoggedIn = false;

  clientData: ClientData | null = null;

  client: DeepstreamClient;

  //need to manage own callbacks as a wrapper to this?
  // onFirstConnected(cb: () => void) {
  //   if (this.isConnected) {
  //     console.log('TOO LATE FIRST CONNECTED');

  //     cb();
  //     return;
  //   }
  //   console.log('DEFER FIRST CONNECTED');

  //   this._connectedCbs.push(cb);
  // }

  get isConnected() {
    console.log('NOW STATE', this.state);

    return this.state == 'OPEN';
  }

  async login(loginDetails: LoginDetails) {
    // catch on error

    const clientData = await this.client.login(loginDetails);
    console.log('LOGGED IN with data', clientData);

    runInAction(() => {
      this.isLoggedIn = true;

      this.clientData = clientData as ClientData | null;
    });

    console.log('current state', this.state);

    //   => {
    //   // do nothing, the state is behind us
    //   runInAction(() => {
    //     this.isLoggedIn = success;
    //     this.clientData = clientData as ClientData | null;
    //   });
    //   if (success) {
    //     console.log('LOGGED INTO DC!');
    //   }
    // });
  }

  constructor(uri: string, opts?: DeepsteamClientOptions) {
    this.client = new DeepstreamClient(uri, opts);
    this.client.on('connectionStateChanged', connectionState => {
      // this.state = newState;

      runInAction(() => {
        switch (connectionState) {
          case 'OPEN':
          case 'CLOSED':
          case 'ERROR':
          case 'OFFLINE':
            this.state = connectionState;
            break;
          case 'AWAITING_AUTHENTICATION':
          case 'AUTHENTICATING':
            this.state = 'AUTHENTICATION';
            break;
          default:
            this.state = 'CONNECTING';
        }

        if (connectionState == 'OPEN' && !this._previouslyConnected) {
          //connection.reconnection logic here
          // setTimeout(() => {
          // this._connectedCbs.forEach(cb => {
          //   cb();
          // });
          // this._connectedCbs = [];
          // }, 1000);
        }
      });
    });

    makeAutoObservable(this, {
      client: false,
      // onFirstConnected: false,
      // _connectedCbs: false,
    });
  }
}
