import download from "./download.js"
import { object2blob } from "./utils.js"

export default function downloadObject(obj, filename) {
	const url = URL.createObjectURL(object2blob(obj));
	return download(url, filename).finally(() => URL.revokeObjectURL(url));
}
