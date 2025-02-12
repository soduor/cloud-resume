import {SitePipelineStack} from "./site-pipeline-stack";
import {SiteStack} from './site-stack';
import {Stage, StageProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

export class SitePipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new SiteStack(this, 'SiteStack')
        new SitePipelineStack(this, 'SitePipelineStack')
    }
}