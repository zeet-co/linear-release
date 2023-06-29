var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var core = __toESM(require("@actions/core"));
var import_github = require("@actions/github");
var import_linear_release = require("@zeet/linear-release");
const linearTeam = "ZEET";
const fromtState = "In Staging";
const toState = "In Production";
async function processPushEvent(event) {
  core.info(`The before commit is: ${event.before}`);
  core.info(`The after commit is: ${event.after}`);
  const pullRequests = await (0, import_linear_release.getPullRequests)(".", event.before, event.after);
  core.info(`The pull requests are: ${pullRequests}`);
  const prodStatId = await (0, import_linear_release.getLinearStateId)(linearTeam, toState);
  console.log(`Found production state ${prodStatId}`);
  for (const prNumber of pullRequests) {
    console.log(`Found pull request ${prNumber}`);
    const linearIds = await (0, import_linear_release.getLinearTicketsFromPR)(
      event.repository.owner.login,
      event.repository.name,
      prNumber
    );
    for (const linearId of linearIds) {
      const status = await (0, import_linear_release.getLinearIssueStatus)(linearId);
      console.log(`Linear issue ${linearId} is ${status?.name}`);
      if (status?.name === fromtState && linearId.startsWith(`${linearTeam}-`)) {
        console.log(`Moving linear issue ${linearId} to ${toState}}`);
        await (0, import_linear_release.updateLinearState)(linearId, prodStatId);
      }
    }
  }
}
async function run() {
  try {
    if (import_github.context.eventName === "push") {
      const pushPayload = import_github.context.payload;
      await processPushEvent(pushPayload);
      core.info("processed push event");
    } else {
      core.error("The event that triggered this action was not a push event.");
    }
  } catch (error) {
    if (error instanceof Error)
      core.setFailed(error.message);
  }
}
run();
