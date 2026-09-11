# GitHub Repository Settings Checklist

These controls cannot be encoded fully inside a ZIP and should be configured in GitHub settings after upload/push.

For both public repositories:

- Protect `main`.
- Require pull requests for routine changes where practical.
- Require passing CI checks before merge.
- Prevent force-push to protected `main` unless an explicitly authorized recovery action is required.
- Enable secret scanning / push protection where available.
- Review Dependabot/security alerts where available.
- Keep repository write access limited to authorized maintainers.
- Require review for changes to governance, security, workflow and production configuration files.
- Consider signed commits/tags for controlled stable releases.
- Select an explicit repository/content license through HSF management/legal review before making reuse rights claims.
