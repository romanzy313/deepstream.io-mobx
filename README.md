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

You also need to run deepstream server. If you have docker installed run `server.sh`.

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
    autocreate: true
  }
);
```

And use it as you would normally use MobX. Note: make sure not to access doc property on RemoteRecord when it is not ready, as it will not be initialized. This can be done by checking isReady property on the RemoteRecord. I've tries to type it correctly, but it doesn't seem to be possible. Example:

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

- [x] DsClientInstance - wrapper around the client
- [x] RemoteRecord - wrapper around Record
- [x] Nested record properties (path translation)
- [ ] RemoteList - wrapper around List as Mobx Atom
- [ ] RemoteCollection - a map of records in the list
- [ ] Nested records and list - detect if properties are RemoteRecord or RemoteList and load them automatically, while nesting the path of the document

## Issues to solve

- [ ] Deletion of plain arrays in the record (undefined does not work)
- [ ] Non-existing deleted then created record has instabilities
- [ ] Possible? race condition when updating multiple properties as the same time, as deepstream does not support batching/transactions
- [ ] Inefficient updates. The two libraries go back and forth notifying each other of changes. But there are no issues as they both do diffing, which is potentially bad for performance
