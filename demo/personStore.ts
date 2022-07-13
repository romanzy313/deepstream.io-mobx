import { makeAutoObservable } from 'mobx';
import { RemoteRecord } from '../src';
import { RemoteList } from '../src/RemoteList';
import { baseDocName, dsClient } from './dsStore';

export class PersonRecord {
  name: string = 'Bob';
  age: number = 23;
  interestedIn = {
    mobx: false,
    deepstream: false,
  };

  //the problem is that this will be put on the doc aswell... oh well
  // colors: RemoteListAtom;

  get isOld() {
    return this.age >= 21;
  }

  setName(name: string) {
    this.name = name;
  }

  setAge(age: number) {
    this.age = age;
  }

  toggleInterest(whichOne: 'mobx' | 'deepstream') {
    this.interestedIn[whichOne] = !this.interestedIn[whichOne];
  }

  constructor() {
    // this.colors = new RemoteListAtom(`${baseName}/colors`, {
    //   client: dsClient.client,
    // });
    makeAutoObservable(this);
  }
}
const personRootName = baseDocName + '_person';
export const personStore = new RemoteRecord(
  personRootName,
  () => new PersonRecord(),
  {
    // client: dsClient.client, //it is autoinjected
    autocreate: true,
  }
);
