# sinonquire

> Automatically stubs CommonJS modules returned by require/import using Sinon.JS

> Inspired by [Jest's "mock by default"](https://facebook.github.io/jest/) concept.

## Installation

```sh
npm install --save sinonquire
```

## Usage

The following example uses
[mocha](https://mochajs.org/),
[chai](http://chaijs.com/) and
[sinon-chai](https://github.com/domenic/sinon-chai).

First, let's tell **sinonquire** which paths should never be loaded as stubs.

`test/index.js`:
```js
import sinonquire from 'sinonquire';

sinonquire.excludePaths(
  '/node_modules/mocha/',
  '/my-app/test/'
);
```

Then, make sure this configuration module is started before all the tests.
One way to do it is using the `--require` argument of mocha CLI.

`package.json`:
```json
"scripts": {
  "test": "mocha --recursive --require ./test/index.js"
}
```

OK. Now suppose your app has two main modules, one is a class
and the other is a function that instantiate the class a couple of times.

> Based on [this Jest example](https://facebook.github.io/jest/docs/automatic-mocking.html).

`lib/User.js`:
```js
export default class User() {

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

}
```

`lib/createCouple.js`:
```js
import User from './User.js';

export default function createCouple(nameA, nameB) {
  const userA = new User();
  userA.setName(nameA);

  const userB = new User();
  userB.setName(nameB);

  return [userA, userB];
}
```

`test/createCouple.js`:
```js
import {expect} from 'chai';
import sinonquire from 'sinonquire';

describe('createCouple', () => {

  let createCouple;

  beforeEach(() => {
    sinonquire.dontStub('../lib/createCouple.js');
    createCouple = require('../lib/createCouple.js');
  });

  afterEach(() => {
    sinonquire.resetStubs(); // needed for correct spying (eg. calls count)
  });

  it('should spy instance methods', () => {
    const couple = createCouple('userA', 'userB');
    expect(couple[0].setName).to.have.been.calledWith('userA');
    expect(couple[1].setName).to.have.been.calledWith('userB');
  });

  it('should stub instance methods', () => {
    const couple = createCouple('userA', 'userB');
    couple[0].getName.returns('something new');
    expect(couple[0].getName()).to.equal('something new');
  });

  it('should spy class instantiation', () => {
    createCouple('userA', 'userB');
    const User = require('../lib/User.js');
    expect(User).to.have.been.calledTwice;
    expect(User).to.have.been.calledWithNew;
  });

});

```
