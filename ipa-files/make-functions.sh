#!/bin/bash

for x in {0..9} {a..z}
do
	file="ipa$x.txt"
	if test -f "$file"; then
		sed -i 's/^/"/' "$file"
		sed -i "1s/^/export default function populateIpa$x(table) {\nreturn table.set({\n/" "$file"
		echo -e "}, undefined, \"$x\");\n}" >> "$file"
		mv "$file" "ipa$x.js"
	fi
done
