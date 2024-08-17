const axios = require('axios');
const treeify = require('treeify');
const fs = require('fs');

// 异步递归函数，用于获取仓库中的所有目录和文件
async function fetchRepoContents(user, repo, path = '', tree = {}) {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
    try {
        const response = await axios.get(url, {
            header: {
                'Authorization': `token YOUR_OAUTH_TOKEN`
            }
        });
        const data = response.data;

        for (let item of data) {
            if (item.type === 'file') {
                tree[item.path] = 'file';
            } else if (item.type === 'dir') {
                tree[item.path] = {};
                await fetchRepoContents(user, repo, item.path, tree[item.path]);
            }
        }
    } catch (error) {
        console.error('Error fetching repository contents:', error);
    }
    return tree;
}

// 将目录树转换为 Markdown 格式
function treeToMarkdown(tree, indent = 0) {
    let markdown = '';
    for (let key in tree) {
        markdown += `${'  '.repeat(indent)}- ${key}\n`;
        if (tree[key] !== 'file') {
            markdown += treeToMarkdown(tree[key], indent + 1);
        }
    }
    return markdown;
}

// 主函数，用于启动目录获取过程并保存为 Markdown 文件
async function generateMarkdownTree(user, repo) {
    const tree = await fetchRepoContents(user, repo);
    const markdown = treeToMarkdown(tree);
    fs.writeFileSync('directoryTree.md', markdown);
    console.log('Markdown tree has been saved to directoryTree.md');
}

// 示例使用：获取 'octocat/Hello-World' 仓库的目录结构并保存为 Markdown 文件
generateMarkdownTree('octocat', 'Hello-World');