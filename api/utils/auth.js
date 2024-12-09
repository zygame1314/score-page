const UPYUN = require('upyun');

const upyun = new UPYUN.Service({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD
});

export async function verify(username, password) {
    try {
        const client = new UPYUN.Client(upyun);

        const result = await client.getFile('/users.json');
        const users = JSON.parse(result.toString());

        const user = users.find(u =>
            u.username === username && u.password === password
        );

        return !!user;
    } catch (error) {
        console.error('验证失败:', error);
        return false;
    }
}