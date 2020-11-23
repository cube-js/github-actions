"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticAction = void 0;
const action_1 = require("./action");
const github = require("@actions/github");
class AutomaticAction extends action_1.AbstractAction {
    async handle() {
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
                throw new Error(`Unsupported eventName: "${github.context.eventName}"`);
        }
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