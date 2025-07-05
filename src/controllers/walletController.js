import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Calcula o saldo do usuário autenticado
export const getBalance = async (req, res) => {
  try {
    // Recupera o ID do usuário autenticado (setado pelo middleware de autenticação)
    const userId = req.userId;
    if (!userId) {
      // Se não houver usuário autenticado, retorna erro 401
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Soma todos os valores das transações do tipo 'income' (receitas) do usuário
    const incomes = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'income' }
    });

    // Soma todos os valores das transações do tipo 'expense' (despesas) do usuário
    const expenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'expense' }
    });

    // Calcula o saldo: receitas - despesas
    const balance = (incomes._sum.amount || 0) - (expenses._sum.amount || 0);

    // Retorna o saldo no formato { balance: valor }
    return res.json({ balance });
    
  } catch (error) {
    // Em caso de erro, loga e retorna status 500
    console.error('Erro ao buscar saldo:', error);
    return res.status(500).json({ message: 'Erro ao buscar saldo' });
  }
};

// Retorna o extrato completo de transações do usuário autenticado
export const getStatement = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    // Busca todas as transações do usuário, ordenadas da mais recente para a mais antiga
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    // Retorna o extrato
    return res.json({ transactions });
  } catch (error) {
    console.error('Erro ao buscar extrato:', error);
    return res.status(500).json({ message: 'Erro ao buscar extrato' });
  }
};
