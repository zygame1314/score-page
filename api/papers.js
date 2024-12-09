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
                // 返回指定目录的文件列表
                const response = await listDirectoryWithIter(req.query.path);
                res.status(200).json(response);
            } else {
                // 只返回根目录列表
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