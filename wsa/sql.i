## SQL injection

- SQL injection vulnerability in WHERE clause allowing retrieval of hidden data
- When pattern tags selection use a OR 1=1--
- Info about database : Type and version
- Tables and columns
- Determine number of column and which contain a text data

### Oracle
`' UNION SELECT 'strings1' 'strings2' FROM dual` same result with because `NULL` is not defined data.
`' UNION SELECT NULL NULL FROM dual`
A `--` can count and if you use `--+` it possible that it a `Mysql` 
