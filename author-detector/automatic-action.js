"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticAction = void 0;
const action_1 = require("./action");
const github = require("@actions/github");
class AutomaticAction extends action_1.AbstractAction {
    async handle() {
        if (github.context.payload) {
            return this.handleWebhookPayload(github.context.payload);
        }
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
                return this.handlePullRequests();
            default:
                throw new Error(`Unsupported eventName: "${github.context.eventName}"`);
        }
    }
    async handleWebhookPayload(payload) {
        console.log(payload);
        if (payload.action) {
        }
    }
    /**
     * This event is similar to pull_request, except that it runs in the context of the base repository of
     * the pull request, rather than in the merge commit. This means that you can more safely make your
     * secrets available to the workflows triggered by the pull request, because only workflows defined
     * in the commit on the base repository are run. For example, this event allows you to create workflows
     * that label and comment on pull requests, based on the contents of the event payload.
     *
     */
    async onPullRequestTarget() {
    }
    async handleIssues() {
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
                    throw new Error(`Unsupported issue action: "${github.context.payload.action}"`);
            }
        }
        throw new Error(`Unknown context`);
    }
    async handlePullRequests() {
    }
    async onIssueOpened() {
        throw new Error('Not implemented');
    }
    async onIssueReopened() {
        throw new Error('Not implemented');
    }
    async onIssueClosed() {
        throw new Error('Not implemented');
    }
    async onIssueLabeled() {
        throw new Error('Not implemented');
    }
    async onSchedule() {
        throw new Error('Not implemented');
    }
    async onIssueComment() {
        throw new Error('Not implemented');
    }
}
exports.AutomaticAction = AutomaticAction;
//# sourceMappingURL=automatic-action.js.map