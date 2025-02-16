import {Stack, StackProps} from 'aws-cdk-lib';
import * as ssm from "aws-cdk-lib/aws-ssm";
import {Construct} from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
export class SitePipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const connectionARN = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_CONNECTION')
        const cloudResumeBucket = 'so-cloud-resume';
        const sourceArtifact = new codepipeline.Artifact();
        const buildArtifact = new codepipeline.Artifact('BuildOutput');

        const sourceStage: codepipeline.StageProps = {
            stageName: 'source',
            actions: [new actions.CodeStarConnectionsSourceAction({
                actionName: 'Github_Source',
                owner: 'soduor',
                repo: 'cloud-resume',
                branch: 'develop',
                output: sourceArtifact,
                connectionArn: connectionARN,
                triggerOnPush: true
            })]
        };

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            pipelineName: 'so-cloud-resume-site-pipeline',
            restartExecutionOnUpdate: false,
            stages: [sourceStage]
        });

       const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
            projectName: 'so-cloud-resume-build',
            buildSpec: codebuild.BuildSpec.fromObject({
                version: 0.2,
                phases: {
                    build: {
                        commands: ['aws s3 sync web-app s3://so-cloud-resume --delete']
                    }
                }
            }),
        });

        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                sid: 'AllowS3ListBucket',
                effect: iam.Effect.ALLOW,
                actions: ['s3:ListBucket'],
                resources: [`arn:aws:s3:::${cloudResumeBucket}`]
            })
        );

        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                sid: 'AllowS3PutGetObject',
                effect: iam.Effect.ALLOW,
                actions: ['s3:PutObject', 's3:GetObject'],
                resources: [`arn:aws:s3:::${cloudResumeBucket}/*`]
            })
        );

        pipeline.addStage({
            stageName: 'Build',
            actions: [
                new actions.CodeBuildAction({
                    actionName: 'Build',
                    project: buildProject,
                    input: sourceArtifact,
                    outputs: [buildArtifact]
                })
            ]
        });
    }
}