import pkg from "jsonwebtoken";
const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, JWT_SECRET);

        req.userId = decoded.userId;
        req.userName = decoded.name;

        if (!req.userId) {
            return res.status(401).json({ error: 'Token inválido: ID do usuário não encontrado' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};

export default authMiddleware;