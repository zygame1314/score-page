import { getLoginUrl } from '../utils/auth';

export default function handler(req, res) {
    const loginUrl = getLoginUrl();
    res.redirect(loginUrl);
}