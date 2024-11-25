import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ignore from 'ignore';

export class TreeViewer {
    private ig: ReturnType<typeof ignore>;

    constructor() {
        this.ig = ignore();
    }

    private loadTreeignorePatterns(ignorePath: string): void {
        if (fs.existsSync(ignorePath)) {
            const patterns = fs.readFileSync(ignorePath, 'utf8').split('\n');
            this.ig = ignore().add(patterns);
        }
    }

    private shouldIgnore(relativePath: string): boolean {
        return this.ig.ignores(relativePath);
    }

    private async printTree(
        dirPath: string,
        prefix: string,
        rootPath: string,
        output: vscode.OutputChannel
    ): Promise<void> {
        try {
            const items = fs.readdirSync(dirPath).sort();
            const filteredItems: string[] = [];

            // Filter ignored items
            for (const item of items) {
                const itemFullPath = path.join(dirPath, item);
                const relativePath = path.relative(rootPath, itemFullPath);
                const relativePosixPath = relativePath.split(path.sep).join('/');

                if (this.shouldIgnore(relativePosixPath)) {
                    continue;
                }
                filteredItems.push(item);
            }

            for (let i = 0; i < filteredItems.length; i++) {
                const item = filteredItems[i];
                const itemFullPath = path.join(dirPath, item);
                const isLastItem = i === filteredItems.length - 1;
                const connector = isLastItem ? '└── ' : '├── ';

                if (fs.statSync(itemFullPath).isDirectory()) {
                    output.appendLine(`${prefix}${connector}📁 ${item}/`);
                    const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
                    await this.printTree(itemFullPath, newPrefix, rootPath, output);
                } else {
                    output.appendLine(`${prefix}${connector}📄 ${item}`);
                }
            }
        } catch (error) {
            output.appendLine(`${prefix}└── [Access Denied]`);
        }
    }

    public async showTree(workspaceRoot: string): Promise<void> {
        const output = vscode.window.createOutputChannel('Directory Tree');
        output.show();

        const ignorePath = path.join(workspaceRoot, '.treeignore');
        this.loadTreeignorePatterns(ignorePath);

        const rootName = path.basename(workspaceRoot);
        output.appendLine(`📁 ${rootName}/`);
        await this.printTree(workspaceRoot, '', workspaceRoot, output);
    }
} 