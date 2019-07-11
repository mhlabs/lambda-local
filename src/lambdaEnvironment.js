const aws = require('aws-sdk');

async function mapToLocal(
  stackName,
  region = 'eu-west-1',
  apiProxyLogicalId = 'ApiProxy'
) {
  process.env.AWS_DEFAULT_REGION = region;
  process.env.AWS_REGION = region;

  const cloudFormation = new aws.CloudFormation();
  const lambdaClient = new aws.Lambda();

  const resources = await cloudFormation
    .describeStackResources({ StackName: stackName })
    .promise();

  const apiProxyLambda = resources.StackResources.find(
    r => r.LogicalResourceId === apiProxyLogicalId
  );

  const lambdaFunction = await lambdaClient
    .getFunctionConfiguration({
      FunctionName: apiProxyLambda.PhysicalResourceId
    })
    .promise();

  Object.entries(lambdaFunction.Environment.Variables).forEach(entry => {
    const [key, value] = entry;
    process.env[key] = value;
  });
}

module.exports = {
  mapToLocal
};
