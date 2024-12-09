import UPYUN from 'upyun';
import path from 'path';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

async function listDir(dirPath) {
    try {
        const result = await client.listDir(dirPath);
        return result.files || [];
    } catch (error) {
        console.error(`读取目录失败: ${dirPath}`, error);
        return [];
    }
}

async function generateIndex() {
    const paperIndex = {};
    const papers = await listDir('/papers');

    for (const subject of papers) {
        if (!subject.isDirectory) continue;

        paperIndex[subject.name] = {};
        const classes = await listDir(`/papers/${subject.name}`);

        for (const classFolder of classes) {
            if (!classFolder.isDirectory) continue;

            const files = await listDir(`/papers/${subject.name}/${classFolder.name}`);
            const paperFiles = files.filter(f => {
                const ext = path.extname(f.name).toLowerCase();
                return ['.doc', '.docx', '.pdf'].includes(ext);
            });

            paperIndex[subject.name][classFolder.name] = paperFiles.map(file => ({
                id: `${subject.name}_${classFolder.name}_${file.name}`,
                title: file.name,
                fileName: file.name,
                filePath: `/papers/${subject.name}/${classFolder.name}/${file.name}`,
                size: file.size,
                lastModified: file.time
            }));
        }
    }

    try {
        await client.putFile('/papers/index.json', JSON.stringify(paperIndex, null, 2));
        console.log('index.json生成成功');
    } catch (error) {
        console.error('上传index.json失败:', error);
    }
}

generateIndex();