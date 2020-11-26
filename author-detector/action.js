"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractAction = exports.isBot = exports.getRequiredInput = void 0;
const github = require("@actions/github");
const core = require("@actions/core");
const getRequiredInput = (name) => {
    const value = core.getInput(name);
    if (value) {
        return value;
    }
    throw new Error(`Unable to get require input parameter: ${name}`);
};
exports.getRequiredInput = getRequiredInput;
const BOTS = [
    'dependabot-preview'
];
function isBot(login) {
    return BOTS.includes(login.toLowerCase());
}
exports.isBot = isBot;
class AbstractAction {
    constructor(api = github.getOctokit(exports.getRequiredInput('token'))) {
        this.api = api;
    }
    async run() {
        try {
            await this.handle();
        }
        catch (error) {
            core.setFailed(error.message);
        }
    }
}
exports.AbstractAction = AbstractAction;
//# sourceMappingURL=action.js.map