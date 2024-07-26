import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';

export function activate(context: vscode.ExtensionContext) {
  console.log('恭喜，您的擴充套件 "i18n-show-value" 現在已啟用！');

  const i18nFilePath = path.join(vscode.workspace.rootPath || '', 'src/i18n/locales/zh-TW.json');

  let i18nData: any = {};
  // 如果 i18n 檔案存在，則讀取該檔案的內容
  if (fs.existsSync(i18nFilePath)) {
    i18nData = JSON.parse(fs.readFileSync(i18nFilePath, 'utf8'));
  } else  {
    // 如果 i18n 檔案不存在，則使用預設的測試資料
    i18nData = {
      a: {
        b: '測試',
        c: '測試2'
      }
    };
    vscode.window.showInformationMessage(`使用預設的測試 i18n ${i18nFilePath}`);
  }

  // 定義修飾類型
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: '翻譯',
      color: 'gray',
      margin: '0 0 0 3px'
    }
  });

  // 更新修飾
  const updateDecorations = () => {
    if (vscode.window.activeTextEditor) {
      const editor = vscode.window.activeTextEditor;
      const text = editor.document.getText();
      const regex = /t\('([^']+)'\)/g;
      const decorations: vscode.DecorationOptions[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const key = match[1];
        const value = _.get(i18nData, key.replace(/:/g, '.')) || `Key "${key}" not found`;
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        decorations.push({
          range,
          renderOptions: {
            after: {
              contentText: `${value}`,
              color: 'gray'
            }
          }
        });
      }
      editor.setDecorations(decorationType, decorations);
    }
  };

  // Command implementation
  const disposable = vscode.commands.registerCommand('i18n-show-value.replaceKeys', () => {
    updateDecorations();
  });
  context.subscriptions.push(disposable);

  // 在活動的編輯器更改和文件保存時觸發更新
  
  vscode.window.onDidChangeActiveTextEditor(updateDecorations);
  vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document === vscode.window.activeTextEditor?.document) {
      updateDecorations();
    }
  });

  // 初始修飾更新
  updateDecorations();
}

export function deactivate() {}
