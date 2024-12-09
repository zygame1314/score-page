import UPYUN from 'upyun';

const upyun = new UPYUN.Service({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD
});

export async function verify(username, password) {
    try {
        const client = new UPYUN.Client(upyun);

        console.log('服务配置:', {
            serviceName: process.env.UPYUN_SERVICE_NAME,
            operatorName: process.env.UPYUN_OPERATOR_NAME
        });

        const result = await client.getFile('/users.json');
        console.log('文件内容:', result.toString());

        const users = JSON.parse(result.toString());
        const user = users.find(u =>
            u.username === username && u.password === password
        );

        return !!user;
    } catch (error) {
        console.error('验证失败详情:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        return false;
    }
}