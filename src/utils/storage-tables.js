import MemoryCache from "./memory-cache.js";
import TableByKeyPrefix from "./table-by-key-prefix.js";
import TableByParentKey from "./table-by-parent-key.js";

export const addonStorage = browser.storage.local;
export const audioTable = new TableByKeyPrefix("audioTable", addonStorage, "a");
export const audioCache = new MemoryCache("audioCache");
export const ipaTable = new TableByKeyPrefix("ipaTable", addonStorage, "i");
export const ipaCache = new MemoryCache("ipaCache");
export const defaultIpaTable = new TableByParentKey("defaultIpaTable", addonStorage, "defaultIpa");
export const optionsTable = new TableByParentKey("optionsTable", addonStorage, "options");
export const optionsCache = new MemoryCache("optionsCache");
export const defaultOptionsTable = new TableByParentKey("defaultOptionsTable", addonStorage, "defaultOptions");
export const controlTable = new TableByParentKey("controlTable", addonStorage, "control");
export const errorsTable = new TableByParentKey("errorsTable", addonStorage, "errors");
export const audioTextCache = new MemoryCache("audioTextCache"); // no storage
export const ipaTextCache = new MemoryCache("ipaTextCache"); // no storage
