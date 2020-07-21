const physicalResourceId = 'XYZ';

function CloudFormation() {
  this.describeStackResources = config => {
    const stackName = config.StackName;

    if (stackName !== 'virtual-test-stack') {
      return { promise: () => Promise.resolve(null) };
    }

    const lambdaResource = {
      LogicalResourceId: 'ApiProxy',
      PhysicalResourceId: physicalResourceId
    };

    return {
      promise: () =>
        Promise.resolve({
          StackResources: [lambdaResource]
        })
    };
  };
}
function Lambda() {
  this.getFunctionConfiguration = config => {
    const functionName = config.FunctionName;
    const functionConfiguration = {
      Environment: {
        Variables: { CODE_LIMIT: '5' }
      }
    };
    if (functionName !== physicalResourceId) {
      return { promise: () => Promise.resolve(null) };
    }

    return { promise: () => Promise.resolve(functionConfiguration) };
  };
}

function SSO() {}
function SSOOIDC() {}

module.exports = {
  CloudFormation,
  Lambda,
  SSO,
  SSOOIDC
};
