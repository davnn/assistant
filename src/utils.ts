import * as vscode from "vscode";
import { Maybe } from "purify-ts";
import { Configuration, CreateEditResponse, CreateCompletionResponse, OpenAIApi } from "openai";
import { Logger } from "tslog";

const logger: Logger = new Logger({ name: "assistant", displayFilePath: "hidden" });
const getConfig = <T = string>(key: string) => vscode.workspace.getConfiguration("assistant").get(key) as T;

interface Config {
    gpt3: Gpt3;
}

interface Gpt3 {
    apiKey: Maybe<string>;
    completions: Completions;
    edits: Edits;
}

interface Completions {
    model: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    n: number;
    bestOf: number;
}

interface Edits {
    model: string;
    instruction: string;
    n: number;
    temperature: number;
    topP: number;
}

const config: Config = {
    gpt3: {
        apiKey: Maybe.fromFalsy(getConfig("gpt3.apiKey")),
        completions: {
            model: getConfig("gpt3.completions.model"),
            maxTokens: getConfig("gpt3.completions.maxTokens"),
            temperature: getConfig("gpt3.completions.temperature"),
            topP: getConfig("gpt3.completions.topP"),
            n: getConfig("gpt3.completions.n"),
            bestOf: getConfig("gpt3.completions.bestOf"),
        },
        edits: {
            model: getConfig("gpt3.edits.model"),
            instruction: getConfig("gpt3.edits.instruction"),
            n: getConfig("gpt3.edits.n"),
            temperature: getConfig("gpt3.edits.temperature"),
            topP: getConfig("gpt3.edits.topP"),
        },
    },
};

enum Errors {
    missingGPT3APIKeyError = "Cannot run `assistant` without a GPT-3 API Key, please provide one in the " +
        "`assistant.gpt3.apiKey` settings option.",
    missingEditorError = "Cannot run `assistant` when no text editor is active, please open a document first.",
    missingSelection = "Cannot run `assistant` without an active text selection, please select text first.",
    failedGPTApiRequest = "The request to GPT-3 was not successful, check if the OpenAI API is up and " +
        "running and if you have enough credit left (https://beta.openai.com/account/usage).",
}

const getEditor = () =>
    Maybe.fromNullable(vscode.window.activeTextEditor).orDefaultLazy(() => {
        throw new Error(Errors.missingEditorError);
    });
const getSelection = (editor: vscode.TextEditor) => {
    if (editor.selection.isEmpty) {
        throw new Error(Errors.missingSelection);
    } else {
        return editor.document.getText(editor.selection);
    }
};
const getSelectionOrCurrentLine = (editor: vscode.TextEditor) => {
    return editor.selection.isEmpty
        ? editor.document.lineAt(editor.selection.active.line).text
        : editor.document.getText(editor.selection);
};
const createAPI = () =>
    new OpenAIApi(
        new Configuration({
            apiKey: config.gpt3.apiKey.orDefaultLazy(() => {
                throw new Error(Errors.missingGPT3APIKeyError);
            }),
        }),
    );
const extractResponse = (responseData: CreateCompletionResponse | CreateEditResponse): string => {
    const textResult = Maybe.fromFalsy(responseData.choices[0].text);
    return textResult.orDefaultLazy(() => {
        vscode.window.showWarningMessage("Received empty result, try again with a different query.");
        return "";
    });
};
const warnUnsupportedN = (configValue: number): number => {
    if (configValue !== 1) {
        vscode.window.showWarningMessage("Currently, only one return value is supported, `n` is discarded.");
    }
    return 1;
};

export {
    logger,
    config,
    Errors,
    getEditor,
    getSelection,
    getSelectionOrCurrentLine,
    createAPI,
    extractResponse,
    warnUnsupportedN,
};
