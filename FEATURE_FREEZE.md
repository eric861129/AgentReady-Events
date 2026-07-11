# Day 22 Feature Freeze

Freeze point: `day-22-v1`. The product contains exactly five WebMCP Tools: `search_events`, `get_event_details`, `save_event`, `prepare_event_registration`, and `prepare_registration_cancellation`.

The three accepted Journeys are search → details → save, prepare registration → human submit, and prepare cancellation → human confirm. Registration submission and cancellation finalization are deliberately not Tools. From Day 23 onward, work may improve verification, security, packaging, observability, reliability, and documentation, but must not add product features or weaken human confirmation.
