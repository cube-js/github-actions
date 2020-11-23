import {AbstractAction} from "./action";
import * as github from "@actions/github";

export class AutomaticAction extends AbstractAction {
    public async handle(): Promise<void> {
        switch (github.context.eventName) {
            case 'schedule':
                return this.onSchedule();
            case 'issue_comment':
                return this.onIssueComment();
            case 'issues':
                return this.handleIssues();
            case 'pull_request':
                return this.handlePullRequests();
            default:
                throw new Error(
                    `Unsupported eventName: "${github.context.eventName}"`
                );
        }
    }

    protected async handleIssues()
    {
        if (github.context.issue) {
            switch (github.context.payload.action) {
                case 'opened':
                    return this.onIssueOpened();
                case 'reopened':
                    return this.onIssueReopened();
                case 'closed':
                    return this.onIssueClosed();
                case 'labeled':
                    return this.onIssueLabeled();
                default:
                    throw new Error(
                        `Unsupported issue action: "${github.context.payload.action}"`
                    );
            }
        }

        throw new Error(
            `Unknown context`
        );
    }

    protected async handlePullRequests()
    {

    }

    protected async onIssueOpened()
    {
        throw new Error('Not implemented');
    }

    protected async onIssueReopened()
    {
        throw new Error('Not implemented');
    }

    protected async onIssueClosed()
    {
        throw new Error('Not implemented');
    }

    protected async onIssueLabeled()
    {
        throw new Error('Not implemented');
    }

    protected async onSchedule()
    {
        throw new Error('Not implemented');
    }

    protected async onIssueComment()
    {
        throw new Error('Not implemented');
    }
}
