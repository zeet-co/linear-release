var import__ = require("../");
var import_linear_release = require("../lib/linear-release");
const githubRepo = "anchor";
const githubOwner = "zeet-co";
const workDir = `../../zeet/${githubRepo}/`;
const traceBack = 50;
async function main() {
  console.log("hello");
  const pullRequests = await (0, import__.getPullRequests)(
    workDir,
    "master",
    `master~${traceBack}`
  );
  const prodStatId = await (0, import__.getLinearStateId)("ZEET", "In Production");
  console.log(`Found production state ${prodStatId}`);
  for (const prNumber of pullRequests) {
    console.log(`Found pull request ${prNumber}`);
    const linearIds = await (0, import_linear_release.getLinearTicketsFromPR)(
      githubOwner,
      githubRepo,
      prNumber
    );
    for (const linearId of linearIds) {
      const status = await (0, import_linear_release.getLinearIssueStatus)(linearId);
      console.log(`Linear issue ${linearId} is ${status?.name}`);
      if (status?.name === "In Staging" && linearId.startsWith("ZEET-")) {
        console.log(`Moving linear issue ${linearId} to production`);
        await (0, import_linear_release.updateLinearState)(linearId, prodStatId);
      }
    }
  }
}
main();
