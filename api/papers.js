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
            } else if (req.query.path) {
                const response = await listDirectoryWithIter(req.query.path);
                res.status(200).json(response);
            } else {
                const response = await listDirectoryWithIter('/papers');
                res.status(200).json(response);
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