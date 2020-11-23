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

        const label = getRequiredInput(
            isMember ? CORE_LABEL : COMMUNITY_LABEL
        );

        await this.api.issues.addLabels({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issue.number,
            labels: [
                label,
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
            const prsWithoutLabels = prs.data.filter(
                (pr) => {
                    const labels = pr.labels.map((label) => label.name);

                    return !(labels.includes(CORE_LABEL) || labels.includes(COMMUNITY_LABEL))
                }
            );

            const users = Array.from(
                new Set(
                    prsWithoutLabels.map((pr) => pr.user.login.toLowerCase()),
                ),
            );

            const map = new Map();

            await Promise.all(
                users.map(
                    async (login: string) => {
                        const isMember = await this.checkMembershipForUser(login, github.context.repo.owner);
                        map.set(login, isMember);
                    },
                )
            );

            for (const pr of prsWithoutLabels) {
                await this.addLabel(pr, map.get(pr.user.login.toLowerCase()));
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
