### 🚀 `assistant` Visual Studio Code Extension

Your personal (re-) writing assistant for [Visual Studio Code](https://code.visualstudio.com/) based
on [GPT-3](https://en.wikipedia.org/wiki/GPT-3).

## Getting started

1. Get an API Key from OpenAI <https://beta.openai.com/account/api-keys>
2. Add the API Key to VSCode Settings (`assistant.gpt3.apiKey`)
3. Trigger your first completion using `ctrl+cmd+j`
4. Trigger your first edit using `ctrl+cmd+g`

Hint: You do not have to use the keyboard shortcuts, in the VSCode command palette (`ctrl+shift+p`) simply search for `gpt3` to identify the relevant commands.

## Features

### Trigger completions based on GPT-3

![](https://github.com/davnn/assistant/raw/main/assets/completion.gif)

### Edit your text using instructions with GPT-3

![](https://github.com/davnn/assistant/raw/main/assets/edit.gif)

## Extension Settings

Configure this extension using the `assistant` settings, for example, it is possible to change the model used for
completions in `assistant.gpt3.completions.model` (default is `text-davinci-002`).
