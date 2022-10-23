import {
    config,
    createAPI,
    Errors,
    extractResponse,
    getEditor,
    getSelectionOrCurrentLine,
    logger,
    warnUnsupportedN,
} from "./utils";
import * as vscode from "vscode";
import { TextEditor } from "vscode";

async function complete(): Promise<void> {
    try {
        logger.debug("Starting completion");
        const editor: TextEditor = getEditor();
        const selection: string = getSelectionOrCurrentLine(editor).trim();
        logger.debug("Selection determined:", selection);
        vscode.window.showInformationMessage(`Fetching completion for "${selection}"`);
        const result = await fetchCompletion(selection);
        logger.debug("Completion determined:", result);
        editor.edit((text) =>
            text.insert(
                new vscode.Position(Math.max(editor.selection.active.line, editor.selection.anchor.line) + 1, 0),
                result,
            ),
        );
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
    }
}

async function fetchCompletion(prompt: string): Promise<string> {
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
            n: warnUnsupportedN(config.gpt3.completions.n),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            best_of: config.gpt3.completions.bestOf,
            prompt: prompt,
        });
        logger.debug("Received completion response:", response.data.choices);
        return extractResponse(response.data);
    } catch (error) {
        logger.error(`Completion request failed with ${error}`);
        throw new Error(Errors.failedGPTApiRequest);
    }
}

export { complete };
