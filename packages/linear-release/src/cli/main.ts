import * as linearRelease from '../';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LinearClient, LinearFetch, User } from '@linear/sdk';
import { Octokit } from '@octokit/rest';

import config from '../lib/config';

const githubRepo = 'captain';
const githubOwner = 'zeet-co';
const workDir = `../../zeet/${githubRepo}/`;
const traceBack = 50;

const linear = new LinearClient({ apiKey: config.linearApiKey });
const github = new Octokit({
  auth: config.githubApiKey,
});

const getPRComments = async (
  repo: string,
  owner: string,
  pull_number: number
) => {
  // pr comments are in fact stored as issues comments
  const { data: comments } = await github.rest.issues.listComments({
    repo,
    owner,
    issue_number: pull_number,
  });
  return comments;
};

const checkLinkAndExtractId = (comment: string) => {
  const pattern = /linear\.app\/zeet\/issue\/(\w+-\d+)\//;
  const match = comment.match(pattern);
  return match ? match[1] : null;
};

const getLinearIssueStatus = async (id: string) => {
  const issue = await linear.issue(id);
  return issue.state;
};

async function main() {
  console.log(linearRelease.linearRelease());

  const cmd = `git log master...master~${traceBack} --pretty="format:%s"`;

  const { stdout } = await promisify(exec)(cmd, {
    cwd: workDir,
  });

  // use regex to find pull requests
  const pullRequests = stdout.matchAll(/\(#(\d+)\)\n/g);

  // list linear workflow production state
  const prodState = await linear.workflowStates({
    filter: {
      name: {
        eq: 'In Production',
      },
      team: {
        key: {
          eq: 'ZEET',
        },
      },
    },
  });
  const prodStatId = prodState?.nodes[0].id;
  if (!prodStatId) {
    throw new Error('Could not find production state');
  }
  console.log(`Found production state ${prodStatId}`);

  for (const pr of pullRequests) {
    const prNumber = pr[1];
    console.log(`Found pull request ${prNumber}`);

    // use github sdk to find pull request comments

    const comments = await getPRComments(
      githubRepo,
      githubOwner,
      parseInt(prNumber)
    );

    const linearIds = new Set<string>();

    for (const comment of comments) {
      const linearId = checkLinkAndExtractId(comment.body || '');

      if (linearId) {
        console.log(`Found linear issue ${linearId}`);

        linearIds.add(linearId);
      }
    }

    for (const linearId of linearIds) {
      const status = await getLinearIssueStatus(linearId);
      console.log(`Linear issue ${linearId} is ${status?.name}`);

      if (status?.name === 'In Staging' && linearId.startsWith('ZEET-')) {
        // move to production
        console.log(`Moving linear issue ${linearId} to production`);
        await linear.updateIssue(linearId, {
          stateId: prodStatId,
        });
      }
    }
  }
}

main();
