import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

   const cloudResumeBucket = new s3.Bucket(this, 'so-cloud-resume', {
    });

   new cloudfront.Distribution(this, 'so-cloud-resume-dev-distribution', {
        defaultBehavior: {
            origin: origins.S3BucketOrigin.withOriginAccessControl(cloudResumeBucket),
        },
        });
  }
}
