import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

const validateToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error('未授权访问');
    }
    return true;
};

async function listDirectoryWithIter(path, iter = null) {
    const options = {
        limit: 100,
        order: 'asc'
    };
    if (iter) {
        options.iter = iter;
    }
    return await client.listDir(path, options);
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: '方法不允许' });
    }

    try {
        validateToken(req);

        if (req.query.id) {
            const sanitizedId = req.query.id.replace(/\.\.|\//g, '');
            const filePath = `/papers/${sanitizedId}`;
            const fileUrl = await client.getSignedUrl(filePath);

            res.status(200).json({
                id: sanitizedId,
                title: sanitizedId.split('/').pop(),
                fileUrl
            });
        } else {
            const sanitizedPath = req.query.path?.replace(/\.\.|\//g, '') || '';
            const path = `/papers/${sanitizedPath}`.replace(/\/+/g, '/');
            const response = await listDirectoryWithIter(path);
            res.status(200).json(response);
        }
    } catch (error) {
        console.error('API错误:', error);

        if (error.message === '未授权访问') {
            return res.status(401).json({ message: error.message });
        }

        res.status(500).json({
            message: '获取试卷信息失败',
            error: error.message
        });
    }
}