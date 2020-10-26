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
    public async handle(): Promise<void> {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });

        if (issue.user.login) {
            const team = await this.getOrganizationMembers();
            const label = getRequiredInput(
                team.includes(issue.user.login.toLowerCase()) ? 'coreLabel' : 'communityLabel'
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
    }

    protected async getOrganizationMembers() {
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