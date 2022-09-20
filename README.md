# Search .NET Versions

A script to search both BitBucket and GitHub for .NET versions to get an idea of what repos have projects that are using versions that are out of support.

## Prerequisites

A .env file is required with the following values populated:

```
BITBUCKET_DISABLED=[optional] true or false
BITBUCKET_PASSWORD=bitbucket app password
BITBUCKET_USERNAME=bitbucket username
BITBUCKET_WORKSPACE=bitbucet account/workspace
GITHUB_DISABLED=[optional] true or false
GITHUB_ORG=github org
GITHUB_TOKEN=github personal access token
```

## Getting started

Start by installing dependencies by running `npm install` or `yarn`. Then run the script by running `node index.js`.

## References

https://bitbucketjs.netlify.app
https://github.com/octokit/octokit.js
https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core
