import { makeAutoObservable } from 'mobx';
import { RemoteRecord } from '../src';
import { baseDocName, dsClient } from './dsStore';

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

export const personStore = new RemoteRecord(
  baseDocName + '_person',
  () => new PersonRecord(),
  {
    client: dsClient.client,
    autocreate: true,
  }
);
