import * as vscode from "vscode";
import { complete } from "./complete";
import { config, logger } from "./utils";
import { edit } from "./edit";

export async function activate(context: vscode.ExtensionContext) {
    logger.debug("Activating extension");
    logger.debug("Determined configuration:", config);

    // This method is called once when the extension is activated
    logger.debug("Registering 'complete' command");
    const completeCommand = vscode.commands.registerCommand("assistant.complete", complete);
    context.subscriptions.push(completeCommand);

    logger.debug("Registering 'edit' command");
    const editCommand = vscode.commands.registerCommand("assistant.edit", edit);
    context.subscriptions.push(editCommand);

    logger.debug("Extension activated");
}

export function deactivate() {
    // This method is called once when the extension is deactivated
}
