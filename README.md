# Mobx integration with Deepsteam.io

Observable data that syncs with [deepstream server](https://deepstreamio.github.io/)

There is a lot more work to do, this is a very early version, no testing. Feel free to contribute and suggest syntax/implementation details. Any feedback will be appreciated.

The same concept could _(should)_ be also applied to the Mobx State Tree, but I had no luck implementing it.

## About this library

The goal is use deepstream as a remote _reactive_ document store, instead of very non-userfriendly callback way. Nowdays most javascript applications render view as a function of state, which makes deepstream client awkward to work with.

This library abstracts deepstream api inside Mobx stores and atoms, making it very convenient and simple to use. Remote observable stores are so nice to work with.

The goal is to have the following features:

- DsClientInstance - wrapper around the client as Mobx store
- RemoteRecord - wrapper around Record, where user defined store is wrapped as `store.doc`
- RemoteList - wrapper around List as Mobx Atom, where deepstream api has to be used. It would be also possible to make it an array observable
- RemoteCollection - a map of records in the list. Will greatly simplify working with arrays of records, which is a very common usecase
- Nesting of records and lists. Allow to hierarchically nest documents with no extra work on library consumer. In your stores have properies of RemoteRecord, RemoteList, or RemoteCollection class and all underlying complexity will be taken care of

## Getting started

<!-- Install the package on npm:
npm i deepstream.io-mobx -->

```
git clone https://github.com/romanzy-1612/deepstream.io-mobx.git
cd deepstream.io-mobx
npm install
npm start
```

You also need to run deepstream server. If you have docker installed run `server.sh` from root folder of the repo.

## Quick example

First create a global instance of the client and login

```
export const dsClient = new DsClientInstance(
  `ws://${window.location.hostname}:6020`
);
dsClient.login({ username: 'test', password: 'test' });
```

Then create a mobx store

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
    autocreate: true
  }
);
```

And use it as you would normally use MobX. Note: make sure not to access doc property on RemoteRecord when it is not ready, as it will not be initialized. This can be done by checking isReady property on the RemoteRecord. I've tried to type it correctly, but it doesn't seem to be possible. Example:

```
@customElement('person-record')
export class DemoApp extends MobxReactionUpdate(LitElement) {
  private person = personStore;

  render() {
    if (!this.person.isReady)
      return html`
        <div class="root">
          Loading...
          <div>ready? ${this.person.isInitialized}</div>
          <div>does exist? ${this.person.doesExist}</div>
          <button
            @click=${() =>
              this.person.create({
                name: 'mark',
                age: 33,
              })}
          >
            create mark
          </button>
        </div>
      `;

    return html`
      <div class="root">
        <div>User profile:</div>
        <div>name: ${this.person.doc.name}</div>
        <div>age: ${this.person.doc.age}</div>
        <div>Is old? ${this.person.doc.isOld ? 'yes' : 'no'}</div>
        <input
          .value=${this.person.doc.name}
          placeholder="enter name"
          @input=${(e: any) => {
            this.person.doc.setName(e.target.value);
          }}
        />
        <input
          .value=${this.person.doc.age.toString()}
          placeholder="enter age"
          @input=${(e: any) => {
            this.person.doc.setAge(Number(e.target.value));
          }}
        />
        <button @click=${() => this.person.delete()}>Delete document</button>
      </div>
    `;
  }
```

## TODO

- [x] DsClientInstance
- [x] RemoteRecord
- [x] Nested record properties (path translation)
- [x] RemoteList
- [x] Auto inject the client when needed
- [ ] RemoteCollection - a map of records in the list
- [ ] Nested records and list - allow nesting of RemoteRecord or RemoteList inside the RemoteRecord. Allow for autogeneration of paths and automatic loading/disposal

## Issues to solve

- [ ] Deletion of plain arrays in the record (undefined does not work). maybe overwrite the entire array?
- [ ] Deleting and then creating record does not work
- [ ] Possible? race condition when updating multiple properties as the same time, as deepstream does not support batching/transactions
- [ ] Inefficient updates. The two libraries go back and forth notifying each other of changes. But there are no issues as they both do diffing, which is potentially bad for performance
- [ ] Disposing of records have not been tested
