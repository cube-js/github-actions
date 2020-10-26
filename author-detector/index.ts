import * as core from '@actions/core'
import * as github from '@actions/github';

const getRequiredInput = (name: string) => {
    const value = core.getInput(name);
    if (value) {
        return value;
    }

    throw new Error(
        `Unable to get require input parameter: ${name}`,
    );
}

abstract class AbstractAction {
    constructor(
        protected readonly api = github.getOctokit(
            getRequiredInput('token')
        )
    ) {
    }

    public async run() {
        try {
          await this.handle();
        } catch (error) {
          core.setFailed(error.message)
        }
    }

    abstract async handle(): Promise<void>;
}

class AuthorDetector extends AbstractAction {
    protected async addLabel(login: string) {
        const team = await this.getOrganizationMembers();
        const label = getRequiredInput(
            team.includes(login.toLowerCase()) ? 'coreLabel' : 'communityLabel'
        );

        await this.api.issues.addLabels({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            labels: [
                label,
            ],
        });
    }

    protected async onCreatedIssue() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });

        if (issue.user.login) {
            await this.addLabel(issue.user.login);
        }
    }

    protected async onCreatedPullRequest() {
        const { data: pullRequest } = await this.api.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: Number(github.context.payload.pull_request?.number),
        });

        if (pullRequest.user.login) {
            await this.addLabel(pullRequest.user.login);
        }
    }

    public async handle(): Promise<void> {
        if (github.context.payload.pull_request) {
            return this.onCreatedPullRequest();
        }

        return this.onCreatedIssue();
    }

    protected async getOrganizationMembers() {
        this.api.orgs.listMembershipsForAuthenticatedUser

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
        ].map(
            (v) => v.toLowerCase()
        );
    };
}

new AuthorDetector().run();