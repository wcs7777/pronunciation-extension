#!/bin/bash

imports=""
obj="const fns = {"$'\n'""
for x in {0..9} {a..z}
do
	imports+="import populateIpa$x from \"./ipa$x.js\";"$'\n'""
	obj+=$'\t'"\"$x\": populateIpa$x,"$'\n'""
done
imports+=$'\n'
obj+="};"$'\n'""$'\n'""
read -r -d '' for_loop << EOM
export default function populateIpa(table) {
	for (const fragment of Object.keys(fns)) {
		fns[fragment](table)
			.catch((error) => {
				return console.error(
					\`Error populating \${table.name}\${fragment}\`,
					error,
				);
			});
	}
}
EOM
echo "${imports}${obj}${for_loop}" > populate-ipa.js
