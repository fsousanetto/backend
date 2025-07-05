import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(400).json({ message: 'Preencha todos os campos' });
        } 
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/;
    
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: 'Email inválido' });
        } else if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({ message: `A senha deve conter: \n1 letra maiúscula,\n1 caractere especial\nTer no mínimo 6 caracteres` });
        }
        
        const { name, email, password } = req.body;

        const existUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (existUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
    
};

const updateUser = async (req, res) => {
   try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Informe o ID do usuário' });
        }

        const data = {};

        if (name) {
            data.name = name;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'E-mail inválido' });
            }

            const existUser = await prisma.user.findUnique({
                where: { email }
            })

            if (existUser) {
                return res.status(400).json({ message: 'E-mail já cadastrado' });
            }

            data.email = email;
        }

        if (password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/

            if (!passwordRegex.test(password)) {
                return res.status(400).json({ message: `A senha deve conter: \n1 letra maiúscula,\n1 caractere especial\nTer no mínimo 6 caracteres` });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            data.password = hashedPassword;
        }

        if (!Object.keys(data).length) {
            return res.status(400).json({ message: 'Informe os dados que deseja atualizar' });
        }

        const updateUser = await prisma.user.update({
            where: { id },
            data
        });

        res.json(updateUser);

   } catch (error) {
         res.status(500).json({ message: 'Erro ao atualizar usuário' });
   }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if ( !user || !user.password ) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        const isPassword = await bcrypt.compare( password, user.password )
        if ( !isPassword ) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        const token = jwt.sign(
            { userId: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken: token });

    } catch (error) {
        console.log('Erro de login no back', error)
        res.status(500).json({ message: 'Erro ao realizar login',error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findMany({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            }
        });

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        return res.json(user)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar usuários' })
    }
}

export default { register, login, updateUser, getUser };