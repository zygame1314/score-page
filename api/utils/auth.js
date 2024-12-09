import UPYUN from 'upyun';

const upyun = new UPYUN.Service({
    serviceName: process.env.UPYUN_SERVICE_NAME,
    operatorName: process.env.UPYUN_OPERATOR_NAME,
    password: process.env.UPYUN_OPERATOR_PASSWORD
});

// 添加测试连接函数
export async function testUpyunConnection() {
    try {
        const client = new UPYUN.Client(upyun);

        // 打印详细配置
        console.log('完整配置:', {
            serviceName: process.env.UPYUN_SERVICE_NAME,
            operatorName: process.env.UPYUN_OPERATOR_NAME,
            password: process.env.UPYUN_OPERATOR_PASSWORD?.substring(0, 3) + '***'
        });

        // 尝试列出根目录
        const files = await client.listDir('/');
        console.log('目录内容:', files);

        // 尝试读取用户文件
        const userFile = await client.getFile('/users.json');
        console.log('用户文件内容:', userFile.toString());

        return true;
    } catch (error) {
        console.error('连接测试失败:', {
            message: error.message,
            code: error.code,
            url: error.request?.url,
            response: error.response?.data
        });
        return false;
    }
}

// 修改验证函数
export async function verify(username, password) {
    try {
        // 先测试连接
        const isConnected = await testUpyunConnection();
        if (!isConnected) {
            throw new Error('又拍云连接失败');
        }

        const client = new UPYUN.Client(upyun);
        const result = await client.getFile('/users.json');
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