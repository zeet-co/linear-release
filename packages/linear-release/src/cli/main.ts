import { getLinearStateId, getPullRequests } from '../';
import { linear } from '../lib/client';
import {
  getLinearIssueStatus,
  getLinearTicketsFromPR,
  updateLinearState,
} from '../lib/linear-release';

const githubRepo = process.env.GITHUB_REPO || 'anchor';
const githubOwner = process.env.GITHUB_OWNER || 'zeet-co';
const workDir = `../../zeet/${githubRepo}/`;
const traceBack = 50;

async function main() {
  console.log('hello', githubOwner, githubRepo);

  // use regex to find pull requests
  const pullRequests = await getPullRequests(
    workDir,
    'master',
    `master~${traceBack}`
  );

  // list linear workflow production state

  const prodStatId = await getLinearStateId('ZEET', 'In Production');

  console.log(`Found production state ${prodStatId}`);

  for (const prNumber of pullRequests) {
    console.log(`Found pull request ${prNumber}`);

    // use github sdk to find pull request comments
    const linearIds = await getLinearTicketsFromPR(
      githubOwner,
      githubRepo,
      prNumber
    );

    for (const linearId of linearIds) {
      const status = await getLinearIssueStatus(linearId);
      console.log(`Linear issue ${linearId} is ${status?.name}`);

      if (status?.name === 'In Staging' && linearId.startsWith('ZEET-')) {
        // move to production
        console.log(`Moving linear issue ${linearId} to production`);
        await updateLinearState(linearId, prodStatId);
      }
    }
  }
}

main();
