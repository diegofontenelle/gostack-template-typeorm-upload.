import { getCustomRepository, getRepository } from 'typeorm';
//import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { balance } = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError(
        'You do not have enough balance to perform that transaction.',
      );
    }

    let categoryFound = await categoryRepository.findOne({ title: category });

    if (!categoryFound) {
      categoryFound = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryFound);
    }

    const transaction = transactionRepository.create({
      category: categoryFound,
      title,
      type,
      value,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
