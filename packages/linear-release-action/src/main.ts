import * as core from '@actions/core';
import { context } from '@actions/github';
import { PushEvent } from '@octokit/webhooks-definitions/schema';
import {
  getLinearIssueStatus,
  getLinearStateId,
  getLinearTicketsFromPR,
  getPullRequests,
  updateLinearState,
} from '@zeet/linear-release';

const linearTeam = 'ZEET';
const fromtState = 'In Staging';
const toState = 'In Production';

async function processPushEvent(event: PushEvent): Promise<void> {
  // log before after
  core.info(`The before commit is: ${event.before}`);
  core.info(`The after commit is: ${event.after}`);

  const pullRequests = await getPullRequests('.', event.before, event.after);
  core.info(`The pull requests are: ${pullRequests}`);

  // list linear workflow production state

  const prodStatId = await getLinearStateId(linearTeam, toState);

  console.log(`Found production state ${prodStatId}`);

  for (const prNumber of pullRequests) {
    console.log(`Found pull request ${prNumber}`);

    // use github sdk to find pull request comments
    const linearIds = await getLinearTicketsFromPR(
      event.repository.owner.login,
      event.repository.name,
      prNumber
    );

    for (const linearId of linearIds) {
      const status = await getLinearIssueStatus(linearId);
      console.log(`Linear issue ${linearId} is ${status?.name}`);

      if (
        status?.name === fromtState &&
        linearId.startsWith(`${linearTeam}-`)
      ) {
        // move to production
        console.log(`Moving linear issue ${linearId} to ${toState}}`);
        await updateLinearState(linearId, prodStatId);
      }
    }
  }
}

async function run(): Promise<void> {
  try {
    if (context.eventName === 'push') {
      const pushPayload = context.payload as PushEvent;

      await processPushEvent(pushPayload);

      core.info('processed push event');
    } else {
      core.error('The event that triggered this action was not a push event.');
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
