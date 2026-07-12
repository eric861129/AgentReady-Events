targetScope = 'resourceGroup'

param location string = 'eastasia'
param environmentName string = 'cae-agentready-events-ea'
param containerAppName string = 'ca-agentready-events-eval'

@minLength(108)
@maxLength(108)
@description('Public immutable AgentReady Events GHCR manifest digest.')
param imageRef string

@allowed([
  'security'
  'failure:temporary'
  'failure:expired'
])
param mode string

@secure()
param originTrialToken string = ''

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: environmentName
}

module evalApp 'modules/container-app.bicep' = {
  name: 'eval-app'
  params: {
    name: containerAppName
    location: location
    environmentId: environment.id
    imageRef: imageRef
    originTrialToken: originTrialToken
    evalLab: mode
  }
}

output fqdn string = evalApp.outputs.fqdn
output revisionName string = evalApp.outputs.revisionName
output containerAppId string = evalApp.outputs.id
