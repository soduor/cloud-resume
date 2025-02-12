#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {CdkPipelineStack} from "../lib/cdk-pipeline-stack";

const app = new cdk.App();
new CdkPipelineStack(app, 'CloudResumeStack');
