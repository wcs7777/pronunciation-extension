import localStorage from "./local-storage.js";
import Table from "./table.js";
import TableFragmented from "./table-fragmented.js";

export const database = localStorage;
export const ipaTable = new TableFragmented("ipa", database);
export const ipaDefaultTable = new Table("ipaDefault", database);
export const optionsTable = new Table("options", database);
export const audioTable = new Table("audio", database);
export const utilsTable = new Table("utils", database);
