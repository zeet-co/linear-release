import { exec } from 'child_process';
import { promisify } from 'util';
import { github, linear } from './client';

export function linearRelease(): string {
  return 'linear-release';
}

export async function getLinearStateId(
  team: string,
  name: string
): Promise<string> {
  // list linear workflow production state
  const prodState = await linear.workflowStates({
    filter: {
      name: {
        eq: name,
      },
      team: {
        key: {
          eq: team,
        },
      },
    },
  });
  const prodStatId = prodState?.nodes[0].id;
  if (!prodStatId) {
    throw new Error('Could not find production state');
  }

  return prodStatId;
}

export async function updateLinearState(
  issueId: string,
  stateId: string
): Promise<void> {
  await linear.updateIssue(issueId, {
    stateId: stateId,
  });
}

export async function getPullRequests(
  workDir: string,
  before: string,
  after: string
): Promise<number[]> {
  const cmd = `git log ${after}...${before} --pretty="format:%s"`;

  const { stdout } = await promisify(exec)(cmd, {
    cwd: workDir,
  });

  // use regex to find pull requests
  const pullRequests = stdout.matchAll(/\(#(\d+)\)\n/g);

  return [...pullRequests].map((pr) => parseInt(pr[1]));
}

const getPRComments = async (
  owner: string,
  repo: string,
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
  const pattern = /linear\.app\/[\w-]+\/issue\/(\w+-\d+)\//;
  const match = comment.match(pattern);
  return match ? match[1] : null;
};

export const getLinearTicketsFromPR = async (
  githubOwner: string,
  githubRepo: string,
  prNumber: number
): Promise<string[]> => {
  const comments = await getPRComments(githubOwner, githubRepo, prNumber);

  const linearIds = new Set<string>();
  for (const comment of comments) {
    const linearId = checkLinkAndExtractId(comment.body || '');

    if (linearId) {
      linearIds.add(linearId);
    }
  }

  return [...linearIds];
};

export const getLinearIssueStatus = async (id: string) => {
  const issue = await linear.issue(id);
  return issue.state;
};
