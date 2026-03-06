class TickStore {

  constructor() {
    this.rows = new Map();   // key = row[1]
  }

  upsert(row) {

    const key = row[1];

    if (!this.rows.has(key)) {

      // new entry
      this.rows.set(key, [...row]);
        const newRow =    [...row];
        return newRow;
    } else {

      // update only selected fields
      const existing = this.rows.get(key);

      existing[3]  = row[3];
      existing[7]  = row[7];
      existing[8]  = row[8];
      existing[9]  = row[9];
      existing[10] = row[10];
         return existing;
    }
  }

  getAll() {
    return Array.from(this.rows.values());
  }

}
export default TickStore;