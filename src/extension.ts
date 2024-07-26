import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';


export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "i18n-show-value" is now active!');

  const i18nFilePath = path.join(vscode.workspace.rootPath || '', 'src/i18n/locales/zh-TW.json');

  let i18nData: any = {};
  // Create default i18n file if it doesn't exist
  if (fs.existsSync(i18nFilePath)) {
    i18nData = JSON.parse(fs.readFileSync(i18nFilePath, 'utf8'));
  } else  {
    i18nData = {
      a: {
        b: '測試'
      }
    };
    vscode.window.showInformationMessage(`use default test i18n ${i18nFilePath}`);
  }

  // Register code lens provider
  const codeLensProvider = vscode.languages.registerCodeLensProvider('*', {
    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
      const codeLenses: vscode.CodeLens[] = [];
      const text = document.getText();
      const regex = /t\('([^']+)'\)/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const key = match[1];
        // const value = i18nData[key.replace(/:/g, '.')] || `Key "${key}" not found`;
        const value = _.get(i18nData, key.replace(/:/g, '.')) || `Key "${key}" not found`;
        const line = document.lineAt(document.positionAt(match.index).line);
        codeLenses.push(new vscode.CodeLens(line.range, {
          title: `i18n 翻譯: ${value}`,
          command: ''
        }));
      }
      return codeLenses;
    }
  });

  context.subscriptions.push(codeLensProvider);
}

export function deactivate() {}
