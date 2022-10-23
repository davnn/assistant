import { config, createAPI, Errors, getEditor, getSelection, logger } from "./utils";
import * as vscode from "vscode";
import { TextEditor } from "vscode";

async function edit(): Promise<void> {
    try {
        logger.debug("Starting edit");
        const editor: TextEditor = getEditor();
        const selection = getSelection(editor);
        const instruction = await vscode.window.showInputBox({
            title: "Provide instructions how GPT-3 should edit your text",
            placeHolder: config.gpt3.edits.instruction,
            prompt: "If no instruction is provided, the configured default instruction is used.",
        });
        logger.debug("Selection determined:", selection);
        vscode.window.showInformationMessage(`Fetching edit for "${selection}"`);
        const result = await fetchEdit(instruction, selection);
        logger.debug("Edit determined:", result);
        editor.edit((text) => {
            if (config.replace) {
                text.replace(editor.selection, result);
            } else {
                text.insert(
                    new vscode.Position(Math.max(editor.selection.active.line, editor.selection.anchor.line) + 1, 0),
                    result,
                );
            }
        });
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
    }
}

async function fetchEdit(instruction: string | undefined, prompt: string): Promise<string> {
    const openAI = createAPI();
    logger.debug("Sending edit request.");
    try {
        const response = await openAI.createEdit({
            model: config.gpt3.edits.model,
            instruction: instruction ? instruction : config.gpt3.edits.instruction,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            temperature: config.gpt3.edits.temperature,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            top_p: config.gpt3.edits.topP,
            n: 1, // Currently, only one return value is supported and config.gpt3.edits.n is ignored
            input: prompt,
        });
        logger.debug("Received edit response:", response.data);
        const result = response.data.choices[0].text;
        return result ? result : "";
    } catch (error: any) {
        logger.error(`Completion request failed with ${error}`);
        throw new Error(Errors.failedGPTApiRequest);
    }
}

export { edit };
