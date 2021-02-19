#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkCloudmapStack } from '../lib/cdk-cloudmap-stack';

const app = new cdk.App();
new CdkCloudmapStack(app, 'CdkCloudmapStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
