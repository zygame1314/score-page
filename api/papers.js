// papers.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            if (req.query.id) {
                const [subject, className, fileName] = req.query.id.split('_');
                const filePath = `/papers/${subject}/${className}/${fileName}`;
                const fileUrl = client.getSignedUrl(filePath);

                res.status(200).json({
                    id: req.query.id,
                    title: fileName,
                    fileUrl
                });
            } else {
                const papers = await upyun.get('/papers/index.json');
                res.status(200).json(JSON.parse(papers));
            }
        } catch (error) {
            res.status(500).json({ message: '获取试卷信息失败' });
        }
    }
}