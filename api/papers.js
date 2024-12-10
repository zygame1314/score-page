import UPYUN from 'upyun';
import crypto from 'crypto';

const UPYUN_DOMAIN = process.env.UPYUN_DOMAIN;
const SIGN_KEY = process.env.UPYUN_SIGN_KEY;
const SIGN_EXPIRE = 3600;

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

function generateSignature(pathname) {
    const timestamp = Math.floor(Date.now() / 1000) + SIGN_EXPIRE;
    const uri = pathname.replace(/^\//, '');
    const signStr = `/${uri}?_upt=${timestamp}`;
    const sign = crypto.createHash('md5').update(signStr + '&' + SIGN_KEY).digest('hex');
    return `?_upt=${timestamp}&_upd=${sign}`;
}

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
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            validateToken(req);

            if (req.query.id) {
                const filePath = '/papers/' + req.query.id;
                const signature = generateSignature(filePath);
                const fileUrl = `${UPYUN_DOMAIN}${filePath}${signature}`;

                res.status(200).json({
                    id: req.query.id,
                    title: req.query.id.split('/').pop(),
                    fileUrl
                });
            } else {
                const path = req.query.path ? `/papers/${req.query.path}` : '/papers';
                const response = await listDirectoryWithIter(path);
                res.status(200).json({
                    files: response.files || []
                });
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
}