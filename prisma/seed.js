import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Despesas
  { category: 'Internet', type: 'expense' },
  { category: 'Compras', type: 'expense' },
  { category: 'Energia', type: 'expense' },
  { category: 'Água', type: 'expense' },
  { category: 'Variados', type: 'expense' },
  // Receitas
  { category: 'Salário', type: 'income' },
  { category: 'Freela', type: 'income' },
  { category: 'Estágio', type: 'income' },
  { category: 'Plantão', type: 'income' },
];

const main = async () => {
    for (const cat of defaultCategories) {
        await prisma.category.upsert({
            where: { category: cat.category },
            update: { type: cat.type },
            create: cat
        });
    }
    console.log('Categorias padrão criadas!');
}

const runMain = async () => {
    try {
        console.log('Iniciando o seed...');
        await main();
        console.log('Seed concluído com sucesso!');
    } catch (error) {
        console.error('Erro ao executar o seed:', error);
    } finally {
        await prisma.$disconnect();
    }
};

runMain()