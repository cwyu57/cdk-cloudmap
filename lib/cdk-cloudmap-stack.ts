import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as servicediscovery from '@aws-cdk/aws-servicediscovery';

export class CdkCloudmapStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 3, natGateways: 1 });

    const adminConsoleInstance = new ec2.BastionHostLinux(this, 'AdminConsoleInstance', {
      vpc,
      subnetSelection: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
      instanceName: 'AdminConsoleInstance',
    });

    const bastionHostInstance = new ec2.BastionHostLinux(this, 'BastionHostInstance', {
      vpc,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: 'BastionHostInstance',
    });

    adminConsoleInstance.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.allTraffic())

    bastionHostInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(22));  // allow any ip v4 for demo usage, do not use in production environment
    bastionHostInstance.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.allTraffic())

    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'InternalDnsNamespace', {
      name: 'internal.example.com',
      vpc,
    });

    const adminConsoleService = namespace.createService('AdminConsoleService', {
      dnsRecordType: servicediscovery.DnsRecordType.A,
      name: 'admin-console-svc',
      dnsTtl: cdk.Duration.seconds(30),
    });

    adminConsoleService.registerIpInstance('AdminConsoleInstanceIP', {
      ipv4: adminConsoleInstance.instancePrivateIp,
    });
  }
}
