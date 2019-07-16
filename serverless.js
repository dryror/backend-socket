const path = require('path')
const { Component, utils } = require('@serverless/core')

class Socket extends Component {
  async default(inputs = {}) {
    this.context.status(`Deploying`)

    inputs.code = inputs.code || process.cwd()
    inputs.region = inputs.region || 'us-east-1'

    this.context.debug(`Deploying socket in ${inputs.code}.`)
    this.context.debug(`Deploying socket to the ${inputs.region} region.`)

    // Validate - Check for socket.js
    const socketFilePath = path.resolve(inputs.code, 'socket.js')
    if (!(await utils.fileExists(socketFilePath))) {
      throw new Error(`No "socket.js" file found in the current directory.`)
    }

    this.context.status(`Deploying S3 Bucket`)
    this.context.debug(`Deploying s3 bucket for socket.`)

    // Create S3 Bucket
    const lambdaBucket = await this.load('@serverless/aws-s3')
    const lambdaBucketOutputs = await lambdaBucket({
      region: inputs.region
    })

    this.context.status(`Deploying Lambda Function`)
    this.context.debug(`Deploying lambda for socket.`)

    // make sure user does not overwrite the following
    inputs.runtime = 'nodejs10.x'
    inputs.handler = 'shim.socket'
    inputs.shims = [path.resolve(__dirname, './shim.js')]
    inputs.routeSelectionExpression = '$request.body.route'
    inputs.service = 'lambda.amazonaws.com'
    inputs.description = inputs.description || 'Serverless Socket'
    inputs.bucket = lambdaBucketOutputs.name

    const lambda = await this.load('@serverless/aws-lambda')

    const lambdaOutputs = await lambda(inputs)

    inputs.routes = {
      $connect: lambdaOutputs.arn,
      $disconnect: lambdaOutputs.arn,
      $default: lambdaOutputs.arn
    }

    this.context.status(`Deploying WebSockets`)
    this.context.debug(`Deploying aws websockets for socket.`)

    const websockets = await this.load('@serverless/aws-websockets')
    const websocketsOutputs = await websockets(inputs)

    this.state.region = inputs.region
    this.state.url = websocketsOutputs.url
    this.state.routes = Object.keys(websocketsOutputs.routes) || []
    await this.save()

    this.context.debug(
      `Socket with id ${websocketsOutputs.id} was successfully deployed to the ${
        inputs.region
      } region.`
    )

    this.context.debug(`Socket id ${websocketsOutputs.id} url is ${websocketsOutputs.url}.`)

    const outputs = {
      url: this.state.url,
      routes: this.state.routes
    }

    return outputs
  }

  async remove() {
    this.context.status(`Removing`)

    const lambda = await this.load('@serverless/aws-lambda')
    const websockets = await this.load('@serverless/aws-websockets')
    const lambdaBucket = await this.load('@serverless/aws-s3')

    await lambda.remove()
    await websockets.remove()
    await lambdaBucket.remove()

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = Socket
