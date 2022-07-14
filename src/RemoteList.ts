import { createAtom, IAtom } from 'mobx';
import { List } from '@deepstream/client/dist/src/record/list';
import { DeepstreamClient } from '@deepstream/client';
import { LoggerType, makeLogger, waitForClientConnection } from './utils';
import {
  defaultListOpts,
  ListInternalOpts,
  ListOpts,
  SubCallback,
} from './types';
import { getClientOrAutoinject } from './AutoInjector';
// import { applyPatch, createPatch } from '../external/diff/index.js';

export class RemoteList {
  private atom: IAtom;
  private client: DeepstreamClient;
  private config: ListInternalOpts;
  private logger: LoggerType;
  private subHandler?: SubCallback;
  private entries: string[] = [];
  private list?: List;
  private isInitialized: boolean = false;

  public path: string;

  constructor(path: string, opts: ListOpts = {}) {
    // Creates an atom to interact with the MobX core algorithm.
    this.path = path;

    this.client = getClientOrAutoinject(path, opts);

    this.config = Object.assign({}, defaultListOpts, opts);
    this.logger = makeLogger(this.config.logger, path);

    this.atom = createAtom(
      // 1st parameter:
      // - Atom's name, for debugging purposes.
      'RemoteListAtom',
      // 2nd (optional) parameter:
      // - Callback for when this atom transitions from unobserved to observed.
      () => this.becameObserved(),
      // 3rd (optional) parameter:
      // - Callback for when this atom transitions from observed to unobserved.
      () => this.becameUnobserved()
      // The same atom transitions between these two states multiple times.
    );
  }

  get isReady() {
    this.atom.reportObserved();
    return this.list && this.isInitialized;
  }

  get entities() {
    // Let MobX know this observable data source has been used.
    //
    // reportObserved will return true if the atom is currently being observed
    // by some reaction. If needed, it will also trigger the startTicking
    // onBecomeObserved event handler.
    if (this.atom.reportObserved()) {
      return this.entries;
    } else {
      // Depending on the nature of your atom it might behave differently
      // in such circumstances, like throwing an error, returning a default
      // value, etc.
      // return new Date();
      // console.error(this);
      return this.entries;
      // throw new Error('unknown state');
    }
  }

  setEntires(entires: string[]) {
    if (!this.isReady) throw new Error('not intitialized');

    this.entries = entires;
    this.list!.setEntries(entires);
    this.atom.reportChanged();
  }

  addEntry(entry: string);
  addEntry(entry: string, index: number);
  addEntry(entry: string, index?: number) {
    if (!this.isReady) {
      console.error(this);

      throw new Error('not intitialized');
    }
    // should acking be an option?
    // return new Promise((resolve) => {
    //   if (ack)
    //     this.list?.addEntry(entry, index, (err) => {
    //       resolve(err === null)
    //     })

    // optimistic update
    // are they needed in this case? does ds do this for us?

    if (index === undefined) this.entities.push(entry);
    else this.entities.splice(index, 0, entry);
    // if (index === undefined)

    //this does not fix everything getting sent at once
    const realIndex =
      index === undefined || index > 0 ? this.entities.length - 1 : undefined; //apply on the last one?

    this.logger.log(
      'inserting',
      entry,
      'at',
      realIndex,
      'data',
      this.list?.getEntries()
    );

    this.list!.addEntry(entry, realIndex);
    this.atom.reportChanged();
  }

  //how does index work with it
  removeEntry(entry: string);
  removeEntry(entry: string, index: number);
  removeEntry(entry: string, index?: number) {
    if (!this.isReady) throw new Error('not intitialized');

    if (index === undefined) {
      const index = this.entities.findIndex(v => (v = entry));
      this.entities.splice(index, 1);
    } else {
      throw new Error('not implemented, dont know how and what');
    }

    this.list!.removeEntry(entry, index);
    this.atom.reportChanged();
  }

  public delete() {
    this.logger.warn('Deleting remote list');
    return this.list!.delete();
  }

  private _sync() {
    this.subHandler = entries => {
      this.logger.log('update from remote', entries);
      this.entries = entries;
      this.atom.reportChanged();
    };
    this.list!.subscribe(this.subHandler);

    this.list!.on('delete', () => {
      if (this.subHandler) this.list!.unsubscribe(this.subHandler);
      this.isInitialized = false;
      this.atom.reportChanged();
    });
  }

  private async becameObserved() {
    this.logger.log('starting');
    await waitForClientConnection(this.client);
    this.logger.log('client connected');
    this.list = this.client.record.getList(this.path);
    await this.list.whenReady();

    this.entries = this.list.getEntries();
    this.isInitialized = true;
    this.atom.reportChanged();

    this._sync();

    // this.tick(); // Initial tick.
    // this.changeHandler = setInterval(() => this.tick(), 1000);
  }

  public becameUnobserved() {
    this.logger.log('became unobserved');

    if (!this.subHandler) {
      console.error('NO SUB HANDLER');
      return;
    }
    if (!this.list) {
      console.error('no list exits...');
      return;
    }
    this.list.unsubscribe(this.subHandler);
    this.list.discard();
    //cleanup
    this.isInitialized = false;
    this.subHandler = undefined;
    this.entries = [];
    // this.list = undefined; //hmmm

    //no need to report that it was changed?
    this.atom.reportChanged();
  }
}
