import {timingSafeEqual} from 'node:crypto';
export function adminAuth(adminToken) {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const provided = Buffer.from(req.get('authorization') || '');
    const expected = Buffer.from(`Bearer ${adminToken || ''}`);
    if (!adminToken || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return res.status(401).json({error:'Vui lòng đăng nhập quản trị.'});
    }
    next();
  };
}
