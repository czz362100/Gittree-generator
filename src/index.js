const axios = require('axios');
const treeify = require('treeify');

// 异步递归函数，用于获取仓库中的所有目录和文件
async function fetchRepoContents(user, repo, path = '', tree = {}) {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        // 遍历当前目录下的所有项
        for (let item of data) {
            if (item.type === 'file') {
                // 如果是文件，直接添加到树中
                tree[item.path] = 'file';
            } else if (item.type === 'dir') {
                // 如果是目录，递归调用以获取子目录内容
                tree[item.path] = {};
                await fetchRepoContents(user, repo, item.path, tree[item.path]);
            }
        }
    } catch (error) {
        console.error('Error fetching repository contents:', error);
    }
    return tree;
}

// 主函数，用于启动目录获取过程并打印结果
async function generateTree(user, repo) {
    const tree = await fetchRepoContents(user, repo);
    console.log(treeify.asTree(tree, true));
    return tree
}

async function gennerateMdbyTree(tree) {
    const markdown = treeify.asMarkdown(tree);
    console.log(markdown);
    return markdown
}

// 示例使用：获取 'octocat/Hello-World' 仓库的树状结构
gennerateMdbyTree(generateTree('vitejs', 'vite'))