&nbsp;

Deploy a zero configuration Socket backend in seconds using [Serverless Components](https://github.com/serverless/components) with just a few lines of code.

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm install -g @serverless/components
```

### 2. Create

```console
$ mkdir my-socket
$ cd my-socket
```

The directory should look something like this:


```
|- socket.js
|- serverless.yml
|- package.json # optional
```
The `socket.js` file is just a list of socket route/event handlers. Each handler takes two arguments, the first is the `data` passed in from the client, and the second is the `socket` object, which contains helpful data and methods.

```js

// this function gets triggered on new connections
// if not provided, connections are successful by default
on('connect', async (data, socket) => {
  // the following data are available in the socket object
  const { id, domain, stage } = socket
  
  // you can return status codes directly
  return 200
})

 // this function gets triggered whenever a client disconnects
 // if not provided, disconnection is not handled
on('disconnect', async (data, socket) => {
  // e.g. business logic that removes connection ids from a db table
})

 // this function gets triggered whenever a client sends data to the specified route
 // in this example, you're handling the "message" route
 // so clients need to send the following JSON data: { "route": "message", "data": { "foo": "bar" } }
on('message', async (data, socket) => {

  // you can send data to the connected client with the send() function
  await socket.send(data)
})

// this function gets triggered to handle any other data that is not handled above
on('default', async (data, socket) => {
  // you can also send data to a specific connection id (that you might have saved in a table)
  // this is very useful for a broadcasting functionality
  await socket.send(data, connectionId)
})
```

For a real world example of how the `socket.js` file could be used, take a look at how the [Chat Application component is using it](https://github.com/serverless-components/ChatApp/blob/master/backend/socket.js).

### 3. Configure

All the following inputs are optional. However, they allow you to configure your Lambda compute instance and pass environment variables.

```yml
# serverless.yml

name: my-socket
stage: dev

Socket:
  component: "@serverless/socket"
  inputs:
    name: my-socket
    description: My Socket Backend
    regoin: us-east-1
    memory: 128
    timeout: 10
    env:
      TABLE_NAME: my-table
    
    # the directory that contains the socket.js file.
    # If not provided, the default is the current working directory
    code: ./code


```

### 4. Deploy

```console
$ components
```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
