import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

async function listDirectoryWithIter(path, iter = null) {
    const options = {
        limit: 1000,
        order: 'asc'
    };
    if (iter) {
        options.iter = iter;
    }

    return await client.listDir(path, options);
}

async function listDirectory(path) {
    try {
        let allFiles = [];
        let response = await listDirectoryWithIter(path);

        if (!response || !response.files) {
            return { files: [] };
        }

        allFiles = allFiles.concat(response.files);

        while (response && response.next) {
            response = await listDirectoryWithIter(path, response.next);
            if (response && response.files) {
                allFiles = allFiles.concat(response.files);
            }
        }

        const result = {};

        for (const item of allFiles) {
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
        return { files: [] };
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