import UPYUN from 'upyun';
import { schedule } from '@vercel/cron';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

async function checkChanges() {
    try {
        const currentIndex = await client.getFile('/papers/index.json').then(JSON.parse).catch(() => ({}));
        const newIndex = await generateNewIndex();

        if (JSON.stringify(currentIndex) !== JSON.stringify(newIndex)) {
            await client.putFile('/papers/index.json', JSON.stringify(newIndex, null, 2));
            return true;
        }
        return false;
    } catch (error) {
        console.error('检查更新失败:', error);
        throw error;
    }
}

async function generateNewIndex() {
    const paperIndex = {};
    const papers = await listDir('/papers');

    for (const subject of papers) {
        if (!subject.isDirectory) continue;
        paperIndex[subject.name] = {};
        const classes = await listDir(`/papers/${subject.name}`);

        for (const classFolder of classes) {
            if (!classFolder.isDirectory) continue;
            const files = await listDir(`/papers/${subject.name}/${classFolder.name}`);

            paperIndex[subject.name][classFolder.name] = files
                .filter(f => ['doc', 'docx', 'pdf'].includes(f.name.toLowerCase().split('.').pop()))
                .map(file => ({
                    id: `${subject.name}_${classFolder.name}_${file.name}`,
                    title: file.name.split('.')[0],
                    fileName: file.name,
                    filePath: `/papers/${subject.name}/${classFolder.name}/${file.name}`,
                    size: file.size,
                    lastModified: file.time
                }));
        }
    }
    return paperIndex;
}

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            const updated = await checkChanges();
            res.status(200).json({
                message: updated ? '索引已更新' : '无需更新',
                updated
            });
        } else if (req.method === 'GET') {
            const index = await client.getFile('/papers/index.json').then(JSON.parse);
            res.status(200).json(index);
        }
    } catch (error) {
        res.status(500).json({
            message: '操作失败',
            error: error.message
        });
    }
}

schedule('0 * * * *', async () => {
    try {
        await checkChanges();
        console.log('定时索引更新检查完成');
    } catch (error) {
        console.error('定时更新失败:', error);
    }
});