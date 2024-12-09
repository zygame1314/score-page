import UPYUN from 'upyun';
import crypto from 'crypto';

const service = new UPYUN.Service(
    process.env.UPYUN_SERVICE_NAME,
    process.env.UPYUN_OPERATOR_NAME,
    process.env.UPYUN_OPERATOR_PASSWORD
);

const client = new UPYUN.Client(service);

const hashPassword = (password) => {
    return crypto
        .createHash('sha256')
        .update(password + process.env.SALT)
        .digest('hex');
};

export async function verify(username, password) {
    try {
        if (!username || !password) {
            return false;
        }

        const result = await client.getFile('/users.json');
        if (!result) {
            throw new Error('users.json 不存在');
        }

        const users = Array.isArray(result) ? result : [result];
        const hashedPassword = hashPassword(password);

        const user = users.find(u =>
            u.username === username &&
            u.password === hashedPassword
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

export async function createUser(username, password) {
    const hashedPassword = hashPassword(password);
    return {
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };
}