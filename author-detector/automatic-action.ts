import {AbstractAction} from "./action";
import * as github from "@actions/github";
import * as Webhooks from '@octokit/webhooks'
import {WebhookPayload} from "@actions/github/lib/interfaces";
import {WebhookEvent} from "@octokit/webhooks/dist-types/types";
import {EventPayloads} from "@octokit/webhooks/dist-types/generated/event-payloads";

export type OnPullRequestOpenedCtx = { readonly: boolean };

export class AutomaticAction extends AbstractAction {
    public async handle(): Promise<void> {
        // console.info(github.context.eventName);
        //
        // if (github.context.payload) {
        //     return this.handleWebhookPayload(github.context.payload);
        // }

        switch (github.context.eventName) {
            case 'schedule':
                return this.onSchedule();
            case 'issue_comment':
                return this.onIssueComment();
            case 'issues':
                return this.handleIssues();
            case 'pull_request':
                return this.handlePullRequests();
            case 'pull_request_target':
                return this.onPullRequestTarget(github.context.payload);
            default:
                throw new Error(
                    `Unsupported eventName: "${github.context.eventName}"`
                );
        }
    }

    // protected async handleWebhookPayload(payload: WebhookPayload)
    // {
    //     console.info(payload);
    //
    //     if (payload.action) {
    //
    //     }
    // }

    /**
     * This event is similar to pull_request, except that it runs in the context of the base repository of
     * the pull request, rather than in the merge commit. This means that you can more safely make your
     * secrets available to the workflows triggered by the pull request, because only workflows defined
     * in the commit on the base repository are run. For example, this event allows you to create workflows
     * that label and comment on pull requests, based on the contents of the event payload.
     *
     */
    protected async onPullRequestTarget(payload: any)
    {
        switch (payload.action) {
            case 'opened':
                return this.onPullRequestTargetOpened(payload);
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
        // @todo
        return this.onPullRequestOpened({ readonly: true, });
    }

    protected async onPullRequestTargetOpened(payload: EventPayloads.WebhookPayloadPullRequest)
    {
        throw new Error('Not implemented');
    }

    protected async onPullRequestOpened(ctx: OnPullRequestOpenedCtx)
    {
        throw new Error('Not implemented');
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
