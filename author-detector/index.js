"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const getOrganizationMembers = async () => {
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
};
const getRequiredInput = (name) => {
    const value = core.getInput('token');
    if (value) {
        return value;
    }
    throw new Error(`Unable to get require input parameter: ${name}`);
};
async function run() {
    try {
        const api = github.getOctokit(getRequiredInput('token'));
        const { data: issue } = await api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });
        if (issue.user.login) {
            const team = await getOrganizationMembers();
            const label = getRequiredInput(team.includes(issue.user.login.toLowerCase()) ? 'coreLabel' : 'communityLabel');
            api.issues.addLabels({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number,
                labels: [
                    label,
                ],
            });
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=index.js.map