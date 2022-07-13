import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { Record } from '@deepstream/client/dist/src/record/record';
import { DeepstreamClient } from '@deepstream/client';
import {
  convertMobxPathToDsPath,
  isRecordEmpty,
  LoggerType,
  makeLogger,
  waitForClientConnection,
} from './utils';
// import { JSONObject } from '@deepstream/client/src/constants';
import { deepObserve } from 'mobx-utils';
// import { TypedDocument } from './types';

// export type StoreCreatorFn<T> = new () => T;
export type StoreCreatorFn<T> = () => T;
export type SubCallback = (snapshot: any) => void;

export const defaultOpts: ClassOpts = {
  autocreate: false,
  logger: true,
  // client: undefined,
};

export type Opts = {
  autocreate: boolean;
  logger: boolean;
  client: DeepstreamClient; //if empty will attempt to use the global store, needs to be configured, like an instance, created with global flag
};
export type ConstOpts = Partial<Opts>;
export type ClassOpts = Omit<Opts, 'client'>;

// TODO need to provide nice typing, so that it can be created with T type, excluding
type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;
type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type Impossible<K extends keyof any> = {
  [P in K]: never;
};

export type NoExtraProperties<T, U extends T = T> = U extends Array<infer V>
  ? NoExtraProperties<V>[]
  : U & Impossible<Exclude<keyof U, keyof T>>;

// export class RecordStore<T> implements TypedDocument<T> {
export class RemoteRecord<T> {
  public isInitialized: boolean = false;
  public doesExist: boolean = true;
  // public is
  public path: string;

  private client: DeepstreamClient;
  private record!: Record;
  private config: ClassOpts;
  private logger: LoggerType;

  private subHandler?: SubCallback;

  //need a reference to record for our doc store

  // public doc: T | {} = {};
  public doc!: T;

  get isReady() {
    return this.isInitialized && this.doesExist;
  }

  //internal, dont use
  _setState(data: T) {
    this.doesExist = !isRecordEmpty(data); //its not empty when we set it?

    //set the keys separately
    const keys = Object.keys(data);

    keys.forEach(key => {
      const value = data[key];
      if (this.doc[key] === undefined) {
        this.logger.warn(
          'key',
          key,
          'with value',
          value,
          'does not exist on store'
        );
        return;
      }
      this.doc[key] = value;
    });

    // this.doc = data;
  }

  // the T does not work here sadly
  async create(): Promise<boolean>;
  async create(data: NoExtraProperties<T> | any): Promise<boolean>;
  async create(data?: NoExtraProperties<T> | any): Promise<boolean> {
    // do with ack
    // should I handle this error? or let it propograte out?

    const actualData = data === undefined && this.doc ? toJS(this.doc) : data;
    try {
      this._setState(actualData); //set it first
      await this.record.setWithAck(actualData as any);
      runInAction(() => {
        this.doesExist = true;
      });
      this.logger.log('created successfully with', actualData);
      return true;
    } catch (error) {
      this.logger.error(
        'unable to create with data',
        actualData,
        'error',
        error
      );
      runInAction(() => {
        this.doesExist = false;
      });

      return false;
    }
  }

  async delete() {
    //cleanup should happen automatically

    this.logger.warn('Deleting remote record');
    return this.record.delete();
  }

  private _applyMobxPatch(path: string, value: any) {
    this.logger.log('updating remote path `', path, '` with', value);
    this.record!.set(path, value);
  }

  private _sync() {
    const disposer = deepObserve(this.doc, (change, path) => {
      if (!this.doesExist) {
        this.logger.log('ignored changes as we are empty');
        return;
      }
      if (change.observableKind == 'object' && change.type == 'update') {
        const fullPath = convertMobxPathToDsPath(change.name as string, path);

        //after set it is not ready, but its okay, deepstream recovers from that
        this._applyMobxPatch(fullPath, change.newValue);
        // record.set(fullPath, change.newValue);
      } else {
        this.logger.error(
          'failed updating remote',
          path,
          'with change',
          change,
          'as it is not implemented/allowed'
        );
        return;
      }
    });

    this.subHandler = newValue => {
      //just in case for now
      if (isRecordEmpty(newValue)) {
        this.logger.warn('subscription has empty record');
        return;
      }
      this.logger.log('got remote doc', newValue);

      if (!this.isInitialized) {
        this.logger.error(
          'DID NOT HANDLE SUB ON NOT INITIALIZED',
          newValue,
          'isReady',
          this.isReady
        );
        return;
      }
      this._setState(newValue);
    };

    this.record.subscribe(this.subHandler);

    this.record.on('delete', () => {
      disposer();
      runInAction(() => {
        this.doesExist = false;
        // this.isInitialized = false;
      });
      this.logger.warn('Remote record was deleted');

      if (this.record && this.subHandler)
        this.record.unsubscribe(this.subHandler);
    });
  }

  public async _init() {
    this.logger.log('starting');
    await waitForClientConnection(this.client);
    this.logger.log('client connected');
    this.record = this.client.record.getRecord(this.path);
    await this.record.whenReady();
    //running in action
    this.logger.log('record ready');

    runInAction(() => {
      this.isInitialized = true;
    });

    const initialValue = this.record.get(); //get the value, can do it if its empty
    if (isRecordEmpty(initialValue)) {
      this.logger.log('empty initial value', initialValue);
      if (this.config.autocreate) await this.create(); //await is not needed?
    } else {
      this.logger.log('initial value', initialValue);

      // there is data on the remote
      this._setState(initialValue);
      // runInAction(() => {
      //   this.isEmpty = false;
      // })
    }
    this._sync();
  }

  //todo overload in order create without path
  constructor(
    path: string,
    storeCreatorFn: StoreCreatorFn<T>,
    opts: ConstOpts = {}
  ) {
    this.path = path;
    this.doc = storeCreatorFn();
    // this.config = { ...defaultOpts, ...opts };

    if (!opts.client) {
      throw new Error('auto client is not supported yet');
    }
    this.client = opts.client;

    //todo actually remove the client, need a copy
    this.config = Object.assign({}, defaultOpts, opts);
    this.logger = makeLogger(this.config.logger, path);
    //need an async function here
    this._init();
    makeAutoObservable(this);
  }
}
