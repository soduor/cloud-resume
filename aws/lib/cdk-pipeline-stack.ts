import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codestarconnections from "aws-cdk-lib/aws-codestarconnections";
import * as pipelines from "aws-cdk-lib/pipelines";
import * as cdk from "aws-cdk-lib";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SitePipelineStage } from "./pipeline-stage";

export class CdkPipelineStack extends Stack {
  //static connectionARN: string;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const connectionARN = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_CONNECTION')

    const connection = new codestarconnections.CfnConnection(this, "Connection", {
      connectionName: "GitHubConnection",
      providerType: "GitHub"
    });

    //CdkPipelineStack.connectionARN = cdk.Fn.join("", ["arn:aws:codestar-connections:::", connection.ref, "/*"]);

    const source = pipelines.CodePipelineSource.connection("soduor/cloud-resume", "develop", {
      //connectionArn: CdkPipelineStack.connectionARN,
      connectionArn: connectionARN,
      triggerOnPush: true
    });

    const pipeline = new pipelines.CodePipeline(this, "so-cloud-resume-cdk-pipeline", {
      pipelineName: "so-cloud-resume-cdk-pipeline",
      synth: new pipelines.CodeBuildStep("Synth", {
        input: source,
        commands: ["ls -al", "cd aws, ls -al, yarn install --frozen-lockfile", "yarn build", "yarn cdk synth"]
      })
    });

    pipeline.addStage(new SitePipelineStage(this, "Deploy"));
  }
}
