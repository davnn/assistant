import {config, createAPI, Errors, getEditor, getSelectionOrCurrentLine, logger} from "./utils";
import * as vscode from "vscode";
import {CompletionItem, CompletionItemKind, TextEditor} from "vscode";

let activeCompletions: CompletionItem[] = [];

async function complete(): Promise<void> {
    try {
        activeCompletions = [];
        logger.debug("Starting completion");
        const editor: TextEditor = getEditor();
        const selection: string = getSelectionOrCurrentLine(editor).trim();
        logger.debug("Selection determined:", selection);
        const result = await fetchCompletion(selection);
        logger.debug("Completion determined:", result);
        result.forEach(item => activeCompletions.push(createCompletionItem(item)));
        logger.debug("Added completion to completion items.");
        vscode.commands.executeCommand("editor.action.triggerSuggest");
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
    }
}

function createCompletionItem(item: string): CompletionItem {
    const itemTrimmed = item.trim();
    const completionItem = new CompletionItem(itemTrimmed, CompletionItemKind.Text);
    completionItem.documentation = new vscode.MarkdownString(itemTrimmed);
    return completionItem;
}

async function fetchCompletion(prompt: string): Promise<string[]> {
    const openAI = createAPI();
    try {
        logger.debug("Sending completion request.");
        const response = await openAI.createCompletion({
            model: config.gpt3.completions.model,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            max_tokens: config.gpt3.completions.maxTokens,
            temperature: config.gpt3.completions.temperature,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            top_p: config.gpt3.completions.topP,
            n: config.gpt3.completions.n,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            best_of: config.gpt3.completions.bestOf,
            prompt: prompt,
        });
        logger.debug("Received completion response:", response.data.choices);
        return response.data.choices.map(choice => choice.text ? choice.text : "");
    } catch (error) {
        logger.error(`Completion request failed with ${error}`);
        throw new Error(Errors.failedGPTApiRequest);
    }
}

export {
    complete,
    activeCompletions
};
