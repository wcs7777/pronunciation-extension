import MemoryCache from "./memory-cache.js";
import MockStorage from "./mock-storage.js";
import TableByKeyPrefix from "./table-by-key-prefix.js";
import TableByParentKey from "./table-by-parent-key.js";

export const addonStorage = new MockStorage();
export const audioTable = new TableByKeyPrefix(addonStorage, "a");
export const audioCache = new MemoryCache("audioCache", 100);
export const ipaTable = new TableByKeyPrefix(addonStorage, "i");
export const ipaCache = new MemoryCache("ipaCache", 100);
export const defaultIpaTable = new TableByParentKey(addonStorage, "defaultIpa");
export const optionsTable = new TableByParentKey(addonStorage, "options");
export const optionsCache = new MemoryCache("optionsCache", 100);
export const defaultOptionsTable = new TableByParentKey(addonStorage, "defaultOptions");
export const controlTable = new TableByParentKey(addonStorage, "control");
export const errorsTable = new TableByParentKey(addonStorage, "errorsTable");
export const audioTextCache = new MemoryCache("audioTextCache", 100); // no storage
export const ipaTextCache = new MemoryCache("ipaTextCache", 100); // no storage
