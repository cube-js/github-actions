import * as github from '@actions/github';
import {AutomaticAction} from "./automatic-action";
import {getRequiredInput} from "./action";
import {PullsListResponseData} from "@octokit/types/dist-types/generated/Endpoints";

type Unpacked<T> = T extends (infer U)[] ? U : T;

const CORE_LABEL = getRequiredInput('coreLabel');
const COMMUNITY_LABEL = getRequiredInput('communityLabel');

class AuthorDetector extends AutomaticAction {
    protected async addLabel(issue: { number: number }, isMember: boolean) {
        if (isMember) {
            if (getRequiredInput('addCoreLabel') === 'false') {
                return;
            }
        } else {
            if (getRequiredInput('addCommunityLabel') === 'false') {
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

    protected async onIssueOpened() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });

        if (issue.user.login) {
            await this.addLabel(
                issue,
                await this.checkMembershipForUser(
                    issue.user.login.toLowerCase(),
                    github.context.repo.owner
                )
            );
        }
    }

    protected async onP() {
        const { data: issue } = await this.api.issues.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
        });

        if (issue.user.login) {
            await this.addLabel(
                issue,
                await this.checkMembershipForUser(
                    issue.user.login.toLowerCase(),
                    github.context.repo.owner
                )
            );
        }
    }

    protected async onSchedule(): Promise<void> {
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

                return !(labels.includes(CORE_LABEL) || labels.includes(COMMUNITY_LABEL))
            });

            const userMaps = new Map();

            for (const pr of prsWithoutLabels) {
                userMaps.set(pr.user.login.toLowerCase(), false);
            }

            await Promise.all(
                Array.from(userMaps.keys()).map(async (login: string) => {
                    userMaps.set(
                        login,
                        await this.checkMembershipForUser(login, github.context.repo.owner)
                    );
                })
            );

            for (const pr of prsWithoutLabels) {
                await this.addLabel(pr, userMaps.get(pr.user.login.toLowerCase()));
            }
        }
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
