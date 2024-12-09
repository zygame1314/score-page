import UPYUN from 'upyun';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

export async function verify(username, password) {
    try {
        const result = await client.getFile('/users.json');
        if (!result) {
            throw new Error('users.json 不存在');
        }

        const users = Array.isArray(result) ? result : [result];

        const user = users.find(u =>
            u.username === username && u.password === password
        );

        return !!user;
    } catch (error) {
        console.error('验证失败:', {
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}