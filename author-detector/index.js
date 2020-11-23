"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github = require("@actions/github");
const automatic_action_1 = require("./automatic-action");
const action_1 = require("./action");
const CORE_LABEL = action_1.getRequiredInput('coreLabel');
const COMMUNITY_LABEL = action_1.getRequiredInput('communityLabel');
class AuthorDetector extends automatic_action_1.AutomaticAction {
    async addLabel(issue, isMember) {
        if (isMember) {
            if (action_1.getRequiredInput('addCoreLabel') === 'false') {
                return;
            }
        }
        else {
            if (action_1.getRequiredInput('addCommunityLabel') === 'false') {
                return;
            }
        }
        await this.api.issues.addLabels({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issue.number,
            labels: [
                isMember ? CORE_LABEL : COMMUNITY_LABEL,
            ],
        });
    }
    async onIssueOpened() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });
        if (issue.user.login) {
            await this.addLabel(issue, await this.checkMembershipForUser(issue.user.login.toLowerCase(), github.context.repo.owner));
        }
    }
    async onPullRequestOpened() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });
        if (issue.user.login) {
            await this.addLabel(issue, await this.checkMembershipForUser(issue.user.login.toLowerCase(), github.context.repo.owner));
        }
    }
    async onSchedule() {
        const prs = await this.api.pulls.list({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            state: 'open',
            sort: 'created',
            direction: 'desc',
            per_page: 50,
        });
        if (prs.data.length) {
            const prsWithoutLabels = prs.data.filter((pr) => {
                const labels = pr.labels.map((label) => label.name);
                return !(labels.includes(CORE_LABEL) || labels.includes(COMMUNITY_LABEL));
            });
            const userMaps = new Map();
            for (const pr of prsWithoutLabels) {
                userMaps.set(pr.user.login.toLowerCase(), false);
            }
            await Promise.all(Array.from(userMaps.keys()).map(async (login) => {
                userMaps.set(login, await this.checkMembershipForUser(login, github.context.repo.owner));
            }));
            for (const pr of prsWithoutLabels) {
                await this.addLabel(pr, userMaps.get(pr.user.login.toLowerCase()));
            }
        }
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