import populateIpa0 from "./ipa0.js";
import populateIpa1 from "./ipa1.js";
import populateIpa2 from "./ipa2.js";
import populateIpa3 from "./ipa3.js";
import populateIpa4 from "./ipa4.js";
import populateIpa5 from "./ipa5.js";
import populateIpa6 from "./ipa6.js";
import populateIpa7 from "./ipa7.js";
import populateIpa8 from "./ipa8.js";
import populateIpa9 from "./ipa9.js";
import populateIpaa from "./ipaa.js";
import populateIpab from "./ipab.js";
import populateIpac from "./ipac.js";
import populateIpad from "./ipad.js";
import populateIpae from "./ipae.js";
import populateIpaf from "./ipaf.js";
import populateIpag from "./ipag.js";
import populateIpah from "./ipah.js";
import populateIpai from "./ipai.js";
import populateIpaj from "./ipaj.js";
import populateIpak from "./ipak.js";
import populateIpal from "./ipal.js";
import populateIpam from "./ipam.js";
import populateIpan from "./ipan.js";
import populateIpao from "./ipao.js";
import populateIpap from "./ipap.js";
import populateIpaq from "./ipaq.js";
import populateIpar from "./ipar.js";
import populateIpas from "./ipas.js";
import populateIpat from "./ipat.js";
import populateIpau from "./ipau.js";
import populateIpav from "./ipav.js";
import populateIpaw from "./ipaw.js";
import populateIpax from "./ipax.js";
import populateIpay from "./ipay.js";
import populateIpaz from "./ipaz.js";
import populateIpa_ from "./ipa_.js";

const fns = {
	"0": populateIpa0,
	"1": populateIpa1,
	"2": populateIpa2,
	"3": populateIpa3,
	"4": populateIpa4,
	"5": populateIpa5,
	"6": populateIpa6,
	"7": populateIpa7,
	"8": populateIpa8,
	"9": populateIpa9,
	"a": populateIpaa,
	"b": populateIpab,
	"c": populateIpac,
	"d": populateIpad,
	"e": populateIpae,
	"f": populateIpaf,
	"g": populateIpag,
	"h": populateIpah,
	"i": populateIpai,
	"j": populateIpaj,
	"k": populateIpak,
	"l": populateIpal,
	"m": populateIpam,
	"n": populateIpan,
	"o": populateIpao,
	"p": populateIpap,
	"q": populateIpaq,
	"r": populateIpar,
	"s": populateIpas,
	"t": populateIpat,
	"u": populateIpau,
	"v": populateIpav,
	"w": populateIpaw,
	"x": populateIpax,
	"y": populateIpay,
	"z": populateIpaz,
	"_": populateIpa_,
};

export default function populateIpa(table) {
	for (const fragment of Object.keys(fns)) {
		fns[fragment](table)
			.catch((error) => {
				return console.error(
					`Error populating ${table.name}${fragment}`,
					error,
				);
			});
	}
}
