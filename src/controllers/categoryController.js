import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cria uma nova categoria
export const createCategory = async (req, res) => {
    try {
        const { name, type, color } = req.body;
        if (!name || !type) {
            return res.status(400).json({ message: 'Nome e tipo da categoria são obrigatórios.' });
        }
        // Valida duplicidade (nome + tipo)
        const existingCategory = await prisma.category.findFirst({
            where: { name, /* type */ }
        });
        if (existingCategory) {
            return res.status(400).json({ message: 'Categoria já cadastrada.' });
        }
        const newCategory = await prisma.category.create({
            data: { name, /* type, color */ }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Erro ao cadastrar categoria:', error);
        res.status(500).json({ message: 'Erro ao cadastrar categoria' });
    }
};

// Lista todas as categorias
export const getCategory = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        console.log('Categorias encontradas:', categories);
        res.status(200).json(categories);
    } catch (error) {
        console.log('Erro ao buscar categoria: ', error);
        res.status(500).json({ message: 'Erro ao buscar categoria' });
    }
};

// Atualiza uma categoria existente
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, color } = req.body;
        // Busca categoria existente
        const cat = await prisma.category.findUnique({ where: { id: String(id) } });
        if (!cat) {
            return res.status(404).json({ message: 'Categoria não encontrada.' });
        }
        // Valida duplicidade se for alterar nome/tipo
        if (name || type) {
            const exists = await prisma.category.findFirst({
                where: {
                    name: name || cat.name,
                    // type: type || cat.type,
                    NOT: { id }
                }
            });
            if (exists) return res.status(400).json({ message: 'Categoria já existe.' });
        }
        const updated = await prisma.category.update({
            where: { id: String(id) },
            data: { name, /* type, color */ }
        });
        res.status(200).json(updated);
    } catch (error) {
        console.log('Erro ao atualizar categoria: ', error);
        res.status(500).json({ message: 'Erro ao atualizar categoria' });
    }
};

// Deleta uma categoria
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID da categoria é obrigatório' });
        }
        const category = await prisma.category.findUnique({ where: { id: String(id) } });
        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada' });
        }
        await prisma.category.delete({ where: { id: String(id) } });
        res.status(200).json({ message: 'Categoria deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({ message: 'Erro ao deletar categoria' });
    }
};
