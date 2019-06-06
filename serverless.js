const path = require('path')
const { Component, utils } = require('@serverless/components')

class Socket extends Component {
  async default(inputs = {}) {
    inputs = inputs || {}

    this.ui.status(`Running`)

    const shortId = Math.random()
      .toString(36)
      .substring(6)

    // Validate - Check for socket.js
    const socketFilePath = path.resolve(inputs.code || process.cwd(), 'socket.js')
    if (!(await utils.fileExists(socketFilePath))) {
      throw new Error(`No "socket.js" file found in the current directory.`)
      return null
    }

    // Set name - must be lowercase
    inputs.name = this.state.name || `websocket-backend-${this.context.stage}-${shortId}`
    inputs.name = inputs.name.toLowerCase()
    this.state.name = inputs.name
    await this.save()

    this.ui.status(`Deploying Aws S3 Bucket`)

    // Create S3 Bucket
    const lambdaBucket = await this.load('@serverless/aws-s3')
    const lambdaBucketOutputs = await lambdaBucket({
      name: `${inputs.name}-bucket`,
      region: `us-east-1`
    })
    this.state.lambdaBucketName = lambdaBucketOutputs.name
    await this.save()

    this.ui.status(`Deploying Aws Lambda Function`)

    // make sure user does not overwrite the following
    inputs.runtime = 'nodejs8.10'
    inputs.handler = 'shim.socket'
    inputs.shims = [path.resolve(__dirname, './shim.js')]
    inputs.routeSelectionExpression = '$request.body.route'
    inputs.service = 'lambda.amazonaws.com'
    inputs.description = inputs.description || 'Serverless Socket'
    inputs.stage = this.context.stage
    inputs.bucket = lambdaBucketOutputs.name

    const lambda = await this.load('@serverless/aws-lambda')

    const lambdaOutputs = await lambda(inputs)

    inputs.routes = {
      $connect: lambdaOutputs.arn,
      $disconnect: lambdaOutputs.arn,
      $default: lambdaOutputs.arn
    }

    this.ui.status(`Deploying WebSockets`)

    const websockets = await this.load('@serverless/aws-websockets')
    const websocketsOutputs = await websockets(inputs)

    this.state.url = websocketsOutputs.url
    this.state.socketFilePath = socketFilePath
    await this.save()

    const outputs = {
      url: websocketsOutputs.url,
      code: {
        runtime: lambdaOutputs.runtime,
        env: Object.keys(lambdaOutputs.env) || [],
        timeout: lambdaOutputs.timeout,
        memory: lambdaOutputs.memory
      },
      routes: Object.keys(websocketsOutputs.routes) || []
    }

    this.ui.log()
    this.ui.output('url', outputs.url)

    return outputs
  }

  async remove() {
    this.ui.status(`Removing`)

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
