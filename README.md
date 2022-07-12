# Mobx integration with Deepsteam.io

Observable data that syncs with [deepstream server](https://deepstreamio.github.io/)

There is a lot more work to do, this is a very early version, no testing

The same concept could _(should)_ be also applied to the Mobx State Tree, but I had no luck implementing it

## Getting started

<!-- Install the package on npm:
npm i deepstream.io-mobx -->

```
git clone https://github.com/romanzy-1612/deepstream.io-mobx
cd deepstream.io-mobx
npm install
npm run dev
```

## Quick example

First create a global instance of the client and login

```
export const dsClient = new DsClientInstance(
  `ws://${window.location.hostname}:6020`
);
dsClient.login({ username: 'test', password: 'test' });
```

Then create a simple mobx store

```
export class PersonRecord {
  name: string = 'Bob';
  age: number = 23;

  get isOld() {
    return this.age >= 21;
  }

  setName(name: string) {
    this.name = name;
  }

  setAge(age: number) {
    this.age = age;
  }

  constructor() {
    makeAutoObservable(this);
  }
}
```

Next wrap the store in a remote document:

```
export const personStore = new RemoteRecord(
  'person',
  () => new PersonRecord(),
  {
    client: dsClient.client,
  }
);
```

And use it inside your project, while making sure not to access personStore.doc property when it is not ready. This can be done by checking isLive property on the RemoteRecord.

## TODO

- [x] DsClientInstance - wrapper around the client
- [x] RemoteRecord - wrapper around Record
- [ ]
- [ ] Nested record properties
- [ ] RemoteList - wrapper around List
- [ ] RemoteCollection - a map of records in the list
- [ ] Nested records and list - detect if properties are RemoteRecord or RemoteList and load them automatically, while nesting the path of the document

## Issues to solve

- [ ] Deletion of plain arrays in the record (undefined does not work)
- [ ] Non-existing deleted then created record has instabilities

## Prossibly not working features
