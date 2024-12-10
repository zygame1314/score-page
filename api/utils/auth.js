export const WHUT_SSO_URL = 'https://zhlgd.whut.edu.cn/tpass/login';
export const CALLBACK_URL = `${process.env.API_URL}/api/auth/callback`;

export function getLoginUrl() {
    return `${WHUT_SSO_URL}?service=${encodeURIComponent(CALLBACK_URL)}`;
}

export async function verifyTicket(ticket) {
    try {
        const response = await fetch(`${WHUT_SSO_URL}/serviceValidate`, {
            method: 'GET',
            params: {
                ticket: ticket,
                service: CALLBACK_URL
            }
        });

        if (!response.ok) {
            throw new Error('验证ticket失败');
        }

        const data = await response.json();
        return {
            isValid: true,
            studentId: data.studentId,
            name: data.name,
            department: data.department
        };
    } catch (error) {
        console.error('验证失败:', error);
        return { isValid: false };
    }
}