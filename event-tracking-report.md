# Event tracking report

This document lists all PostHog events that have been automatically added to your Next.js application.

## Events by File

### app/login/page.tsx

- **login_magic-link_failed**: Fired when a user's attempt to get a magic link fails due to an invalid email, server error, or network issue.
- **login_magic-link_requested**: Fired when a user successfully submits their UWaterloo email to receive a magic link.

### components/JobForm.tsx

- **job_form_submitted**: Fired when a user successfully submits the job creation or job edit form.
- **job_form_submission_failed**: Fired when a user's attempt to submit the job form fails.

### components/job-search/JobSearchClient.tsx

- **job_search_result_selected**: Fired when a user clicks on a job from the search results list to view its details.
- **job_search_filters_cleared**: Fired when a user clicks the 'Clear' button to reset all search queries and filters.

### components/BookmarkButton.tsx

- **job_bookmark_toggled**: Fired when a user clicks the bookmark button to save or remove a job from their bookmarks. The 'bookmarked' property indicates the new state (true for saved, false for removed).

### components/CreateAlertButton.tsx

- **job_alert_toggled**: Fired when a user clicks the button to turn a job alert on or off for a specific region.

### components/SourceCollectionModal.tsx

- **source_submitted**: User submits the form indicating how they heard about the service.


## Events still awaiting implementation
- (human: you can fill these in)
---

## Next Steps

1. Review the changes made to your files
2. Test that events are being captured correctly
3. Create insights and dashboards in PostHog
4. Make a list of events we missed above. Knock them out yourself, or give this file to an agent.

Learn more about what to measure with PostHog and why: https://posthog.com/docs/new-to-posthog/getting-hogpilled
