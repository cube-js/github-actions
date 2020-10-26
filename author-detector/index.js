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
    async handle() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });
        if (issue.user.login) {
            const team = await this.getOrganizationMembers();
            const label = getRequiredInput(team.includes(issue.user.login.toLowerCase()) ? 'coreLabel' : 'communityLabel');
            await this.api.issues.addLabels({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number,
                labels: [
                    label,
                ],
            });
        }
    }
    async getOrganizationMembers() {
        return [
            'igorlukanin',
            'jkotova',
            'keydunov',
            'levhav',
            'ovr',
            'paveltiunov',
            'rpaik',
            'RusovDmitriy',
            'tenphi',
            'vasilev-alex',
            'YakovlevCoded'
        ].map((v) => v.toLowerCase());
    }
    ;
}
new AuthorDetector().run();
//# sourceMappingURL=index.js.map