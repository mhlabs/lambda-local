const aws = require('aws-sdk');
const ssoAuth = require('@mhlabs/aws-sso-client-auth');

async function mapToLocal(settings) {
  const {
    region = 'eu-west-1',
    apiProxyLogicalId = 'ApiProxy',
    stackName = null,
    ssoStartUrl = null,
    ssoAccountId = null,
    ssoRole = null
  } = settings;

  process.env.AWS_DEFAULT_REGION = region;
  process.env.AWS_REGION = region;

  if (ssoStartUrl) {
    await ssoAuth.configure({
      clientName: stackName,
      startUrl: ssoStartUrl,
      accountId: ssoAccountId,
      region
    });

    aws.config.update({
      credentials: await ssoAuth.authenticate(ssoRole)
    });
  }

  const cloudFormation = new aws.CloudFormation();
  const lambdaClient = new aws.Lambda();

  console.log('Mapping AWS env variables...');

  let resources;

  try {
    resources = await cloudFormation
      .describeStackResources({ StackName: stackName })
      .promise();
  } catch (err) {
    console.log(
      `Error retrieving resources from AWS for stack: ${err.message}`
    );
    console.log('You can still run the local code without AWS env mappings.');
    return;
  }

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

  console.log('Done mapping AWS env variables.');
}

module.exports = {
  mapToLocal
};
