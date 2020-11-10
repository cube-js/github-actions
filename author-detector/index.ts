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
        const isMember = await this.checkMembershipForUser(login.toLowerCase(), github.context.repo.owner);

        if (isMember) {
            if (getRequiredInput('addCoreLabel') === 'false') {
                return;
            }
        } else {
            if (getRequiredInput('addCommunityLabel') === 'false') {
                return;
            }
        }

        const label = getRequiredInput(
            isMember ? 'coreLabel' : 'communityLabel'
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

    protected async checkMembershipForUser(username: string, org: string) {
        // @todo Find a better way...
        try {
            const response = await this.api.orgs.checkMembershipForUser({
                org,
                username,
            });

            return response.status === 204;
        } catch (e) {
            if (e.message === 'User does not exist or is not a public member of the organization') {
                return false;
            }

            throw e;
        }
    };
}

new AuthorDetector().run();