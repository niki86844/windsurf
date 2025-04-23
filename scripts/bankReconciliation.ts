import fs from 'fs';
import { parse } from 'csv-parse';

// Définition du type d'opération
interface Operation {
  date: string;
  label: string;
  amount: number;
}

// Fonction utilitaire pour lire un fichier CSV et retourner un tableau d'opérations
async function readCSV(filePath: string): Promise<Operation[]> {
  return new Promise((resolve, reject) => {
    const records: Operation[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, delimiter: ',' }))
      .on('data', (row) => {
        records.push({
          date: row.date,
          label: row.label,
          amount: parseFloat(row.amount.replace(',', '.')),
        });
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

// Fonction pour rapprocher les opérations
function reconcile(bankOps: Operation[], accountingOps: Operation[]) {
  const matched: Operation[] = [];
  const unmatchedBank: Operation[] = [];
  const unmatchedAccounting: Operation[] = [...accountingOps];

  bankOps.forEach((bankOp) => {
    const idx = unmatchedAccounting.findIndex(
      (accOp) =>
        accOp.amount === bankOp.amount &&
        accOp.date === bankOp.date
    );
    if (idx !== -1) {
      matched.push(bankOp);
      unmatchedAccounting.splice(idx, 1);
    } else {
      unmatchedBank.push(bankOp);
    }
  });

  return { matched, unmatchedBank, unmatchedAccounting };
}

// MAIN
async function main() {
  const bankFile = 'banque.csv';
  const accountingFile = 'compta.csv';

  const [bankOps, accountingOps] = await Promise.all([
    readCSV(bankFile),
    readCSV(accountingFile),
  ]);

  const { matched, unmatchedBank, unmatchedAccounting } = reconcile(bankOps, accountingOps);

  console.log('Opérations rapprochées :', matched.length);
  console.log('Non rapprochées en banque :', unmatchedBank);
  console.log('Non rapprochées en compta :', unmatchedAccounting);
}

main().catch(console.error);
