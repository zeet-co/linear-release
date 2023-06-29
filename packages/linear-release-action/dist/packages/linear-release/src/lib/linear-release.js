var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var linear_release_exports = {};
__export(linear_release_exports, {
  getLinearIssueStatus: () => getLinearIssueStatus,
  getLinearStateId: () => getLinearStateId,
  getLinearTicketsFromPR: () => getLinearTicketsFromPR,
  getPullRequests: () => getPullRequests,
  linearRelease: () => linearRelease,
  updateLinearState: () => updateLinearState
});
module.exports = __toCommonJS(linear_release_exports);
var import_child_process = require("child_process");
var import_util = require("util");
var import_client = require("./client");
function linearRelease() {
  return "linear-release";
}
async function getLinearStateId(team, name) {
  const prodState = await import_client.linear.workflowStates({
    filter: {
      name: {
        eq: name
      },
      team: {
        key: {
          eq: team
        }
      }
    }
  });
  const prodStatId = prodState?.nodes[0].id;
  if (!prodStatId) {
    throw new Error("Could not find production state");
  }
  return prodStatId;
}
async function updateLinearState(issueId, stateId) {
  await import_client.linear.updateIssue(issueId, {
    stateId
  });
}
async function getPullRequests(workDir, before, after) {
  const cmd = `git log ${after}...${before} --pretty="format:%s"`;
  const { stdout } = await (0, import_util.promisify)(import_child_process.exec)(cmd, {
    cwd: workDir
  });
  const pullRequests = stdout.matchAll(/\(#(\d+)\)\n/g);
  return [...pullRequests].map((pr) => parseInt(pr[1]));
}
const getPRComments = async (owner, repo, pull_number) => {
  const { data: comments } = await import_client.github.rest.issues.listComments({
    repo,
    owner,
    issue_number: pull_number
  });
  return comments;
};
const checkLinkAndExtractId = (comment) => {
  const pattern = /linear\.app\/[\w-]+\/issue\/(\w+-\d+)\//;
  const match = comment.match(pattern);
  return match ? match[1] : null;
};
const getLinearTicketsFromPR = async (githubOwner, githubRepo, prNumber) => {
  const comments = await getPRComments(githubOwner, githubRepo, prNumber);
  const linearIds = /* @__PURE__ */ new Set();
  for (const comment of comments) {
    const linearId = checkLinkAndExtractId(comment.body || "");
    if (linearId) {
      linearIds.add(linearId);
    }
  }
  return [...linearIds];
};
const getLinearIssueStatus = async (id) => {
  const issue = await import_client.linear.issue(id);
  return issue.state;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLinearIssueStatus,
  getLinearStateId,
  getLinearTicketsFromPR,
  getPullRequests,
  linearRelease,
  updateLinearState
});
