"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractAction = exports.getRequiredInput = void 0;
const github = require("@actions/github");
const core = require("@actions/core");
exports.getRequiredInput = (name) => {
    const value = core.getInput(name);
    if (value) {
        return value;
    }
    throw new Error(`Unable to get require input parameter: ${name}`);
};
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