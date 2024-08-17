const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 异步递归函数，用于获取仓库中的所有目录和文件
async function fetchRepoContents(user, repo, currentPath = '', basePath = 'markdown') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${currentPath}`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        for (let item of data) {
            const filePath = path.join(currentPath, item.name);
            if (item.type === 'file') {
                // 创建对应的 Markdown 文件
                createMarkdownFile(filePath, basePath);
            } else if (item.type === 'dir') {
                // 递归处理子目录
                await fetchRepoContents(user, repo, filePath, basePath);
            }
        }
    } catch (error) {
        console.error('Error fetching repository contents:', error);
    }
}

// 创建 Markdown 文件
function createMarkdownFile(filePath, basePath) {
    const fullPath = path.join(basePath, filePath);
    const dirName = path.dirname(fullPath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const mdFilePath = path.join(dirName, `${baseName}.md`);

    // 确保目录存在
    fs.mkdirSync(dirName, { recursive: true });

    // 写入 Markdown 文件
    fs.writeFileSync(mdFilePath, `# ${baseName}\n\nFile path: ${filePath}`, 'utf8');
    console.log(`Created Markdown file: ${mdFilePath}`);
}

// 主函数，用于启动目录获取过程
async function generateMarkdownFiles(user, repo) {
    await fetchRepoContents(user, repo);
    console.log('All Markdown files have been created based on the repository structure.');
}

// 示例使用：获取 'octocat/Hello-World' 仓库的结构并生成 Markdown 文件
generateMarkdownFiles('czz362100', 'Gittree-generator');