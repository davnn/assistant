import * as vscode from "vscode";
import {activeCompletions, complete} from "./complete";
import {config, logger} from "./utils";
import {edit} from "./edit";

export async function activate(context: vscode.ExtensionContext) {
    logger.debug("Activating extension");
    logger.debug("Determined configuration:", config);

    // This method is called once when the extension is activated
    logger.debug("Registering 'complete' command");
    const completeCommand = vscode.commands.registerCommand("assistant.complete", complete);
    context.subscriptions.push(completeCommand);

    // Get all known languages
    logger.debug("Identifying available languages");
    const languages = await vscode.languages.getLanguages();

    // Provide completions for all kinds of documents
    logger.debug("Registering completion providers");
    languages.forEach(language => {
        vscode.languages.registerCompletionItemProvider(language, {
            provideCompletionItems: () => {
                logger.debug("Completion items requested for language:", language);
                logger.debug("Completions", activeCompletions);
                return activeCompletions;
            }
        });
    });

    logger.debug("Registering 'edit' command");
    const editCommand = vscode.commands.registerCommand("assistant.edit", edit);
    context.subscriptions.push(editCommand);

    logger.debug("Extension activated");
}

export function deactivate() {
    // This method is called once when the extension is deactivated
}
