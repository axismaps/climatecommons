JS_FILES = \
	map.js \
	news.js \
	view.js \
	layers.js \
	filter.js \
	search.js \
	styles.js \

JS_COMPILER = \
	java -jar google-compiler/compiler-20100616.jar \
	--charset UTF-8

all: ejn.min.js ejn.js

%.min.js: %.js
	$(JS_COMPILER) < $^ > $@

ejn.min.js: ejn.js
	rm -f $@
	$(JS_COMPILER) < ejn.js >> $@

ejn.js: $(JS_FILES) Makefile
	rm -f $@
	cat $(JS_FILES) >> $@

clean:
	rm -rf ejn.js ejn.min.js