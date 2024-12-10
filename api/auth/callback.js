import { verifyTicket } from '../../../utils/auth';
import crypto from 'crypto';

export default async function handler(req, res) {
    const { ticket } = req.query;

    if (!ticket) {
        return res.redirect('/?error=no_ticket');
    }

    try {
        const userData = await verifyTicket(ticket);
        
        if (userData.isValid) {
            const token = crypto.randomBytes(32).toString('hex');

            res.redirect(`/?token=${token}`);
        } else {
            res.redirect('/?error=invalid_ticket');
        }
    } catch (error) {
        console.error('回调处理错误:', error);
        res.redirect('/?error=server_error');
    }
}