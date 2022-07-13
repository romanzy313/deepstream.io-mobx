import { assert, expect } from 'chai';
import { convertMobxPathToDsPath } from './utils';
/*

const immediateProp = {
  change: {
    type: 'update',
    observableKind: 'object',
    name: 'prop',
    newValue: 'Bob4',
  },
  path: '',
};
const nestedProp = {
  change: {
    type: 'update',
    observableKind: 'object',
    name: 'prop',
    newValue: true,
  },
  path: 'some/nested',
};
*/

describe('mobx path conversion to deepstream path', () => {
  it('converts immediate path', () => {
    const res = convertMobxPathToDsPath('prop', '');
    expect(res).to.equal('prop');
    // expect(2).to.equal(2);
  });
  it('converts nested path', () => {
    const res = convertMobxPathToDsPath('prop', 'some/nested');
    expect(res).to.equal('some.nested.prop');
  });
});
