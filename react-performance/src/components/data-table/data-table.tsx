import { useMemo, memo } from 'react';
import type { YearData } from '../../types';
import { formatNumber } from '../../utils/format-utils';

import styles from './data-table.module.css';

type DataTableProps = {
  data: YearData[];
  year: number;
  columns: string[];
};

export const DataTable = memo(({ data, year, columns }: DataTableProps) => {
  const record = useMemo(() => {
    const yearData = data.filter((d) => d.year === year);
    return yearData.length > 0 ? yearData[0] : null;
  }, [data, year]);

  if (!record) {
    return <div className={styles.noData}>No data available for year {year}</div>;
  }

  return (
    <table className={styles.table}>
      <tbody>
        {columns.map((column) => (
          <tr key={column} className={styles.row}>
            <td className={styles.labelCell}>{column.replace(/_/g, ' ').toUpperCase()}</td>
            <td className={styles.valueCell}>
              {formatNumber(record[column as keyof YearData] as number | undefined, {
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

DataTable.displayName = 'DataTable';
