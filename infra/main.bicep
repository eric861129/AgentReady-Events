targetScope = 'resourceGroup'

param location string = 'eastasia'
param environmentName string = 'cae-agentready-events-ea'
param containerAppName string = 'ca-agentready-events'

@minLength(108)
@maxLength(108)
@description('Public immutable image: ghcr.io/eric861129/agentready-events@sha256:<64 lowercase hex>')
param imageRef string

@secure()
param originTrialToken string = ''

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: {
    project: 'agentready-events'
    costCenter: 'ithome-2026'
  }
  properties: {}
}

module production 'modules/container-app.bicep' = {
  name: 'production-app'
  params: {
    name: containerAppName
    location: location
    environmentId: environment.id
    imageRef: imageRef
    originTrialToken: originTrialToken
  }
}

output fqdn string = production.outputs.fqdn
output revisionName string = production.outputs.revisionName
output containerAppId string = production.outputs.id
output environmentId string = environment.id
