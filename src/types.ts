import { DeepstreamClient } from '@deepstream/client';

export type StoreCreatorFn<T> = () => T;
export type SubCallback = (snapshot: any) => void;

export const defaultRecordOpts: RecordInternalOpts = {
  autocreate: false,
  logger: true,
  // client: undefined,
};

type AllRecordOpts = {
  autocreate: boolean;
  logger: boolean;
  client: DeepstreamClient; //if empty will attempt to use the global store, needs to be configured, like an instance, created with global flag
};
export type RecordOpts = Partial<AllRecordOpts>;
export type RecordInternalOpts = Omit<AllRecordOpts, 'client'>;

export const defaultListOpts: ListInternalOpts = {
  logger: true,
  // client: undefined,
};

type AllListOpts = {
  logger: boolean;
  client: DeepstreamClient; //if empty will attempt to use the global store, needs to be configured, like an instance, created with global flag
};
export type ListOpts = Partial<AllListOpts>;
export type ListInternalOpts = Omit<AllListOpts, 'client'>;

// Below do not work and are not used

export interface ReadyDocument<T> {
  isReady: true;
  doesExist: true;
  doc: T;
}
export interface NotReadyDocument {
  isReady: false;
  doesExist: boolean;
  doc: {};
}
export interface NonExistentDocument {
  isReady: boolean;
  doesExist: false;
  doc: {};
}
export type TypedDocument<T> = ReadyDocument<T> &
  NotReadyDocument &
  NonExistentDocument;
