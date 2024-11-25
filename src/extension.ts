/**
 * @fileoverview Handles extension activation and command registration for the tree
 * viewer VSCode extension.
 */

import * as vscode from 'vscode';
import { TreeViewer } from './treeViewer';

export function activate(context: vscode.ExtensionContext) {
	console.log('Tree extension is now active');
	console.log('Registering command: tree.showTree');
	
	const treeViewer = new TreeViewer();

	let disposable = vscode.commands.registerCommand('tree.showTree', async () => {
		console.log('Command tree.showTree was triggered');
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		
		if (!workspaceRoot) {
			vscode.window.showErrorMessage('Please open a workspace first');
			return;
		}

		await treeViewer.showTree(workspaceRoot);
	});

	context.subscriptions.push(disposable);
	console.log('Command registered successfully');
}

export function deactivate() {}
