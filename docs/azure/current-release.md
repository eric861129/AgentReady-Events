# Azure deployment source

- Current release: `v3-p0-release.1`
- Source commit: `8e89e6519406388a0de8c456a890d6fcc8cc5544`
- Deployment status: E3 verified; current-release read-only E4 verified for SEL-01 and SEL-02; E5 pending
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Image: `ghcr.io/eric861129/agentready-events@sha256:8f43bff7fad16300e6eb534cbacda4f4e1969112da0be2e0997773cff77aee41`
- Azure revision: `ca-agentready-events--0000006`
- Workflow run: `30549409859`
- Public URL: `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`
- Public `/health/version`: commit and revision match this record.
- Deployment smoke completes all three Journeys and restores event inventory to 8.
- Inspector traces captured on 2026-07-31 prove two correlated read-only E4 cases on this exact release; the remaining 18 cases, complete Journeys, write paths and E5 are not claimed.
