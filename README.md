# Socket
A serverless component that provisions a socket backend from a single `socket.js` file.

## Usage

### Declarative

```yml

name: my-socket
stage: dev

Socket@0.1.1::my-socket:
  name: my-socket
  description: My Socket Backend
  memory: 128
  timeout: 20
  code: ./code # the directory that contains the socket.js file
  env:
    TABLE_NAME: my-table
  regoin: us-east-1
```

### Programatic

```
npm i --save @serverless/socket
```

```js

const socket = await this.load('@serverless/socket')

const inputs = {
  name: 'my-socket',
  description: 'My Socket Backend',
  memory: 128,
  timeout: 20,
  code: './code' // the directory that contains the socket.js file
}

await socket(inputs)

```
