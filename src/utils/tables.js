import localStorage from "./local-storage.js";
import TableFragmented from "./table-fragmented.js";
import Table from "./table.js";

export const database = localStorage;
export const ipaTable = new TableFragmented("ipa", database);
export const ipaDefaultTable = new Table("ipaDefault", database);
export const optionsTable = new Table("options", database);
export const audioTable = new TableFragmented("audio", database);
export const utilsTable = new Table("utils", database);
