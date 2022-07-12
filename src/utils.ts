import { DeepstreamClient } from '@deepstream/client';

export const makeLogger = (enabled: boolean, recordName: string | false) =>
  enabled
    ? {
        log: (...args) => console.log(`[${recordName}]`, ...args),
        warn: (...args) => console.warn(`[${recordName}]`, ...args),
        error: (...args) => console.error(`[${recordName}]`, ...args),
      }
    : {
        log: (...args) => {},
        warn: (...args) => {},
        error: (...args) => {},
      };
export type LoggerType = ReturnType<typeof makeLogger>;

export const isRecordEmpty = value => Object.keys(value).length == 0;

export function waitForClientConnection(
  client: DeepstreamClient
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (client.getConnectionState() != 'OPEN') {
      const sub = (state: string) => {
        if (state == 'OPEN') {
          // client.off('connectionStateChanged', sub);
          resolve();
        } else if (state == 'ERROR') {
          //todo auth error
          reject('failed to connect');
        }
      };
      client.once('connectionStateChanged', sub);
      // client.on('connectionStateChanged', sub);
    }

    resolve();
  });

  // while (client.getConnectionState() !== 'OPEN') {
  //   console.log('waiting to connect');
  //   await sleep(500);
  // }
}

export const convertMstPathToDsPath = (path: string) =>
  path
    // .substring(1)
    .split('/')
    .map(val => {
      if (/^-?\d+$/.test(val)) return `[${val}]`;
      return `.${val}`;
    })
    .join('')
    .substring(1);

export const convertPath = (path: string) =>
  path
    .substring(1)
    .split('/')
    .map(val => {
      if (/^-?\d+$/.test(val)) return `[${val}]`;
      return `.${val}`;
    })
    .join('')
    .substring(1);
