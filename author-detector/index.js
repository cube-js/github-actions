"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const getRequiredInput = (name) => {
    const value = core.getInput(name);
    if (value) {
        return value;
    }
    throw new Error(`Unable to get require input parameter: ${name}`);
};
class AbstractAction {
    constructor(api = github.getOctokit(getRequiredInput('token'))) {
        this.api = api;
    }
    async run() {
        try {
            await this.handle();
        }
        catch (error) {
            core.setFailed(error.message);
        }
    }
}
class AuthorDetector extends AbstractAction {
    async addLabel(login) {
        const isMember = await this.checkMembershipForUser(login.toLowerCase(), github.context.repo.owner);
        if (isMember) {
            if (getRequiredInput('addCoreLabel') === 'false') {
                return;
            }
        }
        else {
            if (getRequiredInput('addCommunityLabel') === 'false') {
                return;
            }
        }
        const label = getRequiredInput(isMember ? 'coreLabel' : 'communityLabel');
        await this.api.issues.addLabels({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            labels: [
                label,
            ],
        });
    }
    async onCreatedIssue() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });
        if (issue.user.login) {
            await this.addLabel(issue.user.login);
        }
    }
    async onCreatedPullRequest() {
        var _a;
        const { data: pullRequest } = await this.api.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: Number((_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number),
        });
        if (pullRequest.user.login) {
            await this.addLabel(pullRequest.user.login);
        }
    }
    async handle() {
        if (github.context.payload.pull_request) {
            return this.onCreatedPullRequest();
        }
        return this.onCreatedIssue();
    }
    async checkMembershipForUser(username, org) {
        // @todo Find a better way...
        try {
            const response = await this.api.orgs.checkMembershipForUser({
                org,
                username,
            });
            return response.status === 204;
        }
        catch (e) {
            if (e.message === 'User does not exist or is not a public member of the organization') {
                return false;
            }
            throw e;
        }
    }
    ;
}
new AuthorDetector().run();
//# sourceMappingURL=index.js.map