const tested = require('./lambdaEnvironment');

test('Should map env variables', async () => {
  await tested.mapToLocal('virtual-test-stack');
  expect(process.env.AWS_REGION).toBe('eu-west-1');
  expect(process.env.AWS_DEFAULT_REGION).toBe('eu-west-1');
  expect(process.env.CODE_LIMIT).toBe('5');
});
