import * as github from "@actions/github";
import * as core from "@actions/core";

export const getRequiredInput = (name: string) => {
    const value = core.getInput(name);
    if (value) {
        return value;
    }

    throw new Error(
        `Unable to get require input parameter: ${name}`,
    );
}

const BOTS = [
    'dependabot-preview',
    'dependabot-bot',
    'dependabot'
];

export function isBot(login: string) {
    return BOTS.includes(login.toLowerCase()) || login.indexOf('app/') !== -1;
}

export abstract class AbstractAction {
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

    abstract handle(): Promise<void>;
}
