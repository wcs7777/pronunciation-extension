#!/bin/bash

awk '{file = "ipa" substr($0, 1, 1) ".txt"; print > file}' < all.txt
