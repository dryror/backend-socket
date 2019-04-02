&nbsp;

Deploy a zero config Socket backend in seconds using [Serverless Components](https://github.com/serverless/components) with just a few lines of code.

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```
$ npm install -g @serverless/components
```

### 2. Create

```
$ mkdir my-socket
$ cd my-socket
```

the directory should look something like this:


```
|- socket.js
|- serverless.yml
|- package.json # optional

```

the `socket.js` file should minimally look something like this:

```js
on('default', async (data, socket) => {
  socket.send(data)
})

```

For more info on working with the `socket.js` file, checkout the [Socket Component docs](https://github.com/serverless-components/socket).

### 3. Configure

All the following configuration are optional.

```yml
# serverless.yml

name: my-socket
stage: dev

Socket:
  component: @serverless/socket
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

### 4.Deploy

```
$ components
```

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
