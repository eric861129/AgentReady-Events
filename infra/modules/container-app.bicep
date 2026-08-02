param name string
param location string
param environmentId string
param imageRef string
param originTrialToken string = ''
param evalLab string = ''
param enableEvaluationFixtures bool = false

var optionalEnvironment = concat(
  empty(originTrialToken) ? [] : [
    {
      name: 'WEBMCP_ORIGIN_TRIAL_TOKEN'
      value: originTrialToken
    }
  ],
  empty(evalLab) ? [] : [
    {
      name: 'EVAL_LAB'
      value: evalLab
    }
  ],
  enableEvaluationFixtures ? [
    {
      name: 'ENABLE_EVALUATION_FIXTURES'
      value: 'true'
    }
  ] : [
    {
      name: 'ENABLE_EVALUATION_FIXTURES'
      value: 'false'
    }
  ]
)

resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  tags: {
    project: 'agentready-events'
    environment: empty(evalLab) ? 'production' : 'eval'
    costCenter: 'ithome-2026'
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        allowInsecure: false
        targetPort: 3000
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'agentready-events'
          image: imageRef
          env: concat([
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
          ], optionalEnvironment)
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health/live'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health/live'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 3
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 6
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output fqdn string = app.properties.configuration.ingress.fqdn
output revisionName string = app.properties.latestRevisionName
output id string = app.id
