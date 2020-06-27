import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', 'tmp'),
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
});

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const { transactions, balance } = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const createTransactionService = new CreateTransactionService();
    const importTransactionsService = new ImportTransactionsService();
    const transactions: Transaction[] = [];

    const csvData = await importTransactionsService.execute(request.file.path);

    csvData.forEach(async ({ title, value, type, category }) => {
      const transaction = await createTransactionService.execute({
        title,
        value,
        type,
        category,
      });
      transactions.push(transaction);
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
