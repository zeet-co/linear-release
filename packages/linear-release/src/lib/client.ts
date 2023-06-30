import { LinearClient } from '@linear/sdk';
import { Octokit } from '@octokit/rest';

import config from './config';

const linear = new LinearClient({ apiKey: config.linearApiKey });
const github = new Octokit({
  auth: config.githubApiKey,
});

export { github, linear };
