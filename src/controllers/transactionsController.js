import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, description } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ error: 'Tipo de transação inválido' });
        }

        if (!category || !amount) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
        }

        const existingCategory = await prisma.category.findUnique({
            where: { id: category }
        });

        if (!existingCategory) {
            return res.status(400).json({ error: 'Categoria não encontrada' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                type,
                amount: Number(amount),
                date: date ? new Date(date) : new Date(),
                description: description || '',
                user: { connect: { id: userId } },
                category: { connect: { id: existingCategory.id } }
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            include: { category: true},
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar transações' });
    }
};

export const updateTransactions = async (req, res) => {
    try {

        const { id } = req.params;
        const { type, category, amount } = req.body;

        if (!req.userId) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const  transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if ( !transaction || transaction.userId !== req.userId ) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (transaction.userId !== req.userId) {
            return res.status(401).json({ error: 'Acesso negado' });
        }

        const updateTransaction = await prisma.transaction.update({
            where: { id },
            data: { type, category, amount },
        })

        res.json(updateTransaction);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }
        if (transaction.userId !== userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        await prisma.transaction.delete({ where: { id } });
        res.status(200).json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    // Agrupa por categoria e soma os valores
    const history = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId },
      _sum: { amount: true }
    });
    // Busca nomes das categorias
    const categories = await prisma.category.findMany();
    const historyWithLabels = history.map(h => ({
      categoryId: h.categoryId,
      category: categories.find(c => c.id === h.categoryId)?.name || h.categoryId,
      type: categories?.find(c => c.id === h.categoryId)?.type || 'expense', 
      total: h._sum.amount,
    }));
    return res.json({ history: historyWithLabels });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
};

export const getRecent = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const recent = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true }
    });
    return res.json({ recent });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar últimas transações' });
  }
};

