import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

async function listDirectory(path) {
    try {
        const files = await client.listDir(path);
        const result = {};

        for (const item of files) {
            if (item.type === 'F') {
                const subPath = path + '/' + item.name;
                result[item.name] = await listDirectory(subPath);
            } else {
                if (!result.files) result.files = [];
                result.files.push({
                    id: path.replace('/papers/', '') + '/' + item.name,
                    title: item.name
                });
            }
        }

        return result;
    } catch (error) {
        console.error(`列出目录 ${path} 失败:`, error);
        throw error;
    }
}

function transformStructure(data) {
    const result = {};

    for (const subject in data) {
        result[subject] = {};
        for (const className in data[subject]) {
            if (className === 'files') continue;
            result[subject][className] = data[subject][className].files || [];
        }
    }

    return result;
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            if (req.query.id) {
                const filePath = '/papers/' + req.query.id;
                const fileUrl = await client.getSignedUrl(filePath);

                res.status(200).json({
                    id: req.query.id,
                    title: req.query.id.split('/').pop(),
                    fileUrl
                });
            } else {
                const structure = await listDirectory('/papers');
                const papers = transformStructure(structure);
                res.status(200).json(papers);
            }
        } catch (error) {
            console.error('获取试卷失败:', error);
            res.status(500).json({
                message: '获取试卷信息失败',
                error: error.message
            });
        }
    }
}