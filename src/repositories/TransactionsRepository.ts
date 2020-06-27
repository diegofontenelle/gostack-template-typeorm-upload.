import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Response {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Response> {
    const transactions = await this.find();

    console.log(transactions);

    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    balance.total = transactions.reduce((acc, transaction) => {
      const value = parseFloat(transaction.value.toString());

      if (transaction.type === 'income') {
        balance.income += value;
        return acc + value;
      }

      balance.outcome += value;
      return acc - value;
    }, 0);

    return { transactions, balance };
  }
}

export default TransactionsRepository;
