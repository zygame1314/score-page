import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            if (req.query.id) {
                const [subject, className, fileName] = req.query.id.split('_');
                const filePath = `/papers/${subject}/${className}/${fileName}`;
                const fileUrl = await client.getSignedUrl(filePath);

                res.status(200).json({
                    id: req.query.id,
                    title: fileName,
                    fileUrl
                });
            } else {
                const papers = await client.getFile('/papers/index.json');
                res.status(200).json(JSON.parse(papers));
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