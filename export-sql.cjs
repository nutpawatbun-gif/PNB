const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/data/db.json');
const outputPathRoot = path.join(__dirname, 'mcu_database.sql');
const outputPathPublic = path.join(__dirname, 'public/mcu_database.sql');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  const str = String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return "'" + str + "'";
}

let sql = `-- ========================================================\n`;
let dateStr = new Date().toISOString();
sql += `-- MCU University Database Dump for phpMyAdmin / MySQL\n`;
sql += `-- Export Date: ${dateStr}\n`;
sql += `-- Encoding: UTF-8 (utf8mb4)\n`;
sql += `-- ========================================================\n\n`;
sql += `SET NAMES utf8mb4;\n`;
sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

for (const [tableName, rows] of Object.entries(db)) {
  if (!Array.isArray(rows) || rows.length === 0) {
    sql += `-- Table: ${tableName} (Empty)\n`;
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += `CREATE TABLE \`${tableName}\` (\n`;
    sql += `  \`id\` VARCHAR(255) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`data\` LONGTEXT NULL\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;
    continue;
  }

  // Collect unique column keys
  const keysSet = new Set();
  rows.forEach(r => {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach(k => {
        const cleanK = k.trim().replace(/[:;\s]/g, '');
        if (cleanK) {
          if (cleanK !== k) {
            r[cleanK] = r[k];
            delete r[k];
          }
          keysSet.add(cleanK);
        }
      });
    }
  });

  let columns = Array.from(keysSet);
  if (!columns.includes('id')) {
    columns.unshift('id');
  }

  sql += `-- ========================================================\n`;
  sql += `-- Table structure & Data for \`${tableName}\` (${rows.length} records)\n`;
  sql += `-- ========================================================\n`;
  sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
  sql += `CREATE TABLE \`${tableName}\` (\n`;

  const colDefs = columns.map(col => {
    if (col === 'id') {
      return `  \`id\` VARCHAR(255) NOT NULL PRIMARY KEY`;
    }
    return `  \`${col}\` LONGTEXT NULL`;
  });

  sql += colDefs.join(',\n') + '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

  // Batch insert
  const batchSize = 25;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const valueTuples = chunk.map(row => {
      const vals = columns.map(col => escapeSql(row[col]));
      return '  (' + vals.join(', ') + ')';
    });

    sql += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n`;
    sql += valueTuples.join(',\n') + ';\n\n';
  }
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

fs.writeFileSync(outputPathRoot, sql, 'utf8');
fs.writeFileSync(outputPathPublic, sql, 'utf8');
console.log(`[SUCCESS] Database files created:\n - ${outputPathRoot}\n - ${outputPathPublic} (${(fs.statSync(outputPathRoot).size / 1024).toFixed(2)} KB)`);
