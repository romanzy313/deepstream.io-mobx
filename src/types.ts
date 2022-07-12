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
