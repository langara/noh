
# WARINING: This is really old stuff :) Do not use it!

OUT = \
	noh_doc_min1.js \
	noh_doc_min2.js \
	noh_tests_min1.js \
	noh_tests_min2.js \
	noh_example_min1.js \
	noh_example_min2.js \


   
all: $(OUT)


.PHONY: clean all help jsdoc jsdoc_explain

clean:
	rm $(OUT)

help:
	java -jar compiler/compiler.jar --help 2>&1|less

noh_doc_min1.js:
	java -jar compiler/compiler.jar --js noh.js noh_doc.js --js_output_file noh_doc_min1.js --warning_level VERBOSE --externs jquery-1.9.externs.js 

noh_doc_min2.js:
	java -jar compiler/compiler.jar --js noh.js noh_doc.js --js_output_file noh_doc_min2.js --externs jquery-1.9.externs.js --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE

noh_tests_min1.js:
	java -jar compiler/compiler.jar --js noh.js noh_tests.js --js_output_file noh_tests_min1.js --warning_level VERBOSE --externs jquery-1.9.externs.js

noh_tests_min2.js:
	java -jar compiler/compiler.jar --js noh.js noh_tests.js --js_output_file noh_tests_min2.js --externs jquery-1.9.externs.js --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE  

noh_example_min1.js:
	java -jar compiler/compiler.jar --js noh.js noh_example.js --js_output_file noh_example_min1.js --warning_level VERBOSE --externs jquery-1.9.externs.js

noh_example_min2.js:
	java -jar compiler/compiler.jar --js noh.js noh_example.js --js_output_file noh_example_min2.js --externs jquery-1.9.externs.js --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE

jsdoc:
	jsdoc -d apidoc *.js

jsdoc_explain: *.js
	jsdoc --explain *.js > jsdoc_explain


