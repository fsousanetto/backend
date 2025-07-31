import { PrismaClient } from "@prisma/client";
import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import https from "https";

const { sign } = pkg;
const prisma = new PrismaClient();

config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Debug: Mostrar configurações (sem expor secrets completos)
console.log('=== CONFIGURAÇÕES DE DEBUG ===');
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'NÃO CONFIGURADO');
console.log('JWT_SECRET:', JWT_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('================================');

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === '' || password.trim() === '') {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const accessToken = sign({ userId: user.id , name: user.name}, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = sign({ userId: user.id , name: user.name}, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await prisma.refreshToken.deleteMany({
            where: { userId: user.id }
        });

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id
            }
        });

        return res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token não fornecido' });
    }

    try {
        const decoded = pkg.verify(refreshToken, JWT_REFRESH_SECRET);
        const userId = decoded.userId;

        const tokenExists = await prisma.refreshToken.findUnique({
            where: { userId }
        });

        if (!tokenExists || tokenExists.token !== refreshToken) {
            return res.status(400).json({ message: 'Refresh token inválido' });
        }

        const newAccessToken = sign({ userId }, JWT_SECRET, { expiresIn: '15m' });

        return res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao renovar token' });
    }
};

export const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Token não fornecido' });
    }

    try {
        const deleted = await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });

        if (deleted.count === 0) {
            return res.status(400).json({ message: 'Token inválido ou já removido' });
        }

        return res.status(200).json({ message: 'Logout realizado com sucesso' });

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao realizar logout' });
    }
};

// Função auxiliar para fazer requisições HTTPS
const httpsRequest = (url) => {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        ok: response.statusCode >= 200 && response.statusCode < 300,
                        status: response.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    reject(new Error(`Erro ao processar resposta JSON: ${data}`));
                }
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Timeout na requisição'));
        });
    });
};

// Função para decodificar JWT sem verificar (apenas para debug)
const decodeTokenPayload = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload;
    } catch (error) {
        return null;
    }
};

export const loginWithGoogle = async (req, res) => {
    const { idToken } = req.body;
    
    console.log('\n=== INÍCIO DEBUG LOGIN GOOGLE ===');
    console.log('Token recebido:', idToken ? `${idToken.substring(0, 50)}...` : 'NÃO ENVIADO');
    
    if (!idToken) {
        return res.status(400).json({ message: 'Token do Google não enviado' });
    }

    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: 'Configuração do Google não encontrada' });
    }

    // Debug: Tentar decodificar o token para ver o conteúdo
    const decodedToken = decodeTokenPayload(idToken);
    if (decodedToken) {
        console.log('Conteúdo do token decodificado:');
        console.log('- aud (audience):', decodedToken.aud);
        console.log('- iss (issuer):', decodedToken.iss);
        console.log('- exp (expiration):', new Date(decodedToken.exp * 1000));
        console.log('- email:', decodedToken.email);
        console.log('- name:', decodedToken.name);
    } else {
        console.log('Não foi possível decodificar o token');
    }

    try {
        console.log('Fazendo requisição para Google API...');
        
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
        const response = await httpsRequest(url);
        
        console.log('Status da resposta Google API:', response.status);
        console.log('Resposta completa:', JSON.stringify(response.data, null, 2));
        
        if (!response.ok) {
            console.log('Resposta não foi OK');
            throw new Error(`Token inválido - Status: ${response.status}`);
        }
        
        const payload = response.data;

        if (payload.error) {
            console.log('Erro no payload:', payload.error, payload.error_description);
            throw new Error(payload.error_description || 'Token inválido');
        }

        // Verificar se o token é para sua aplicação
        console.log('Verificando Client ID...');
        console.log('Client ID esperado:', GOOGLE_CLIENT_ID);
        console.log('Client ID do token (aud):', payload.aud);
        
        if (payload.aud !== GOOGLE_CLIENT_ID) {
            console.log('Client IDs não coincidem!');
            throw new Error('Token não é para esta aplicação');
        }

        // Verificar se o token não expirou
        const now = Math.floor(Date.now() / 1000);
        console.log('Verificando expiração...');
        console.log('Timestamp atual:', now);
        console.log('Token expira em:', payload.exp);
        
        if (payload.exp && payload.exp < now) {
            console.log('Token expirado!');
            throw new Error('Token expirado');
        }

        if (!payload.email) {
            console.log('Email não encontrado no payload');
            throw new Error('Email não encontrado no token');
        }

        console.log('Token válido! Criando/buscando usuário...');

        let user = await prisma.user.findUnique({ where: { email: payload.email } });
        
        if (!user) {
            console.log('Usuário não existe, criando novo...');
            user = await prisma.user.create({
                data: {
                    name: payload.name || payload.email.split('@')[0],
                    email: payload.email,
                    password: '',
                },
            });
            console.log('Usuário criado:', user.id);
        } else {
            console.log('Usuário existente encontrado:', user.id);
        }

        const accessToken = sign(
            { userId: user.id, name: user.name, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        const refreshToken = sign(
            { userId: user.id, name: user.name }, 
            JWT_REFRESH_SECRET, 
            { expiresIn: '7d' }
        );

        await prisma.refreshToken.deleteMany({
            where: { userId: user.id }
        });

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id
            }
        });

        console.log('Login realizado com sucesso!');
        console.log('=== FIM DEBUG LOGIN GOOGLE ===\n');

        res.json({ 
            accessToken, 
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('ERRO NO LOGIN GOOGLE:', {
            message: error.message,
            stack: error.stack
        });
        console.log('=== FIM DEBUG LOGIN GOOGLE (COM ERRO) ===\n');
        
        let errorMessage = 'Erro na autenticação com Google';
        
        if (error.message.includes('Token inválido') || error.message.includes('Token expirado')) {
            errorMessage = 'Token do Google inválido ou expirado';
        } else if (error.message.includes('não é para esta aplicação')) {
            errorMessage = 'Token não autorizado para esta aplicação';
        }
        
        res.status(401).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            debug: process.env.NODE_ENV === 'development' ? {
                clientIdExpected: GOOGLE_CLIENT_ID,
                tokenAudience: decodedToken?.aud
            } : undefined
        });
    }
};