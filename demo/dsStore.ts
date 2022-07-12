import { DsClientInstance } from '../src';

export const dsClient = new DsClientInstance(
  `ws://${window.location.hostname}:6020`
);
dsClient.login({ username: 'test', password: 'test' });
const hash = window.location.hash.substring(1);
export const baseDocName = hash ? hash : 'demo';

console.log('document base name is', baseDocName);
