import { getLoginUrl } from '../utils/auth.js';

export default function handler(req, res) {
    const loginUrl = getLoginUrl();
    res.redirect(loginUrl);
}