root_dir=.
lib_dir=./lib
dst_dir=./dist
build_dir=./build
build_src=./build/src
plugin_name=$(shell node -p -e "require('./package.json').pluginName")
plugin_name_loser=$(shell node -p -e "require('./package.json').pluginName.toLowerCase()")
plugin_version=$(shell node -p -e "require('./package.json').version")

# all steps for an appstore release
release: npm_init npm_build package

prebuild_release: clean package

npm_init:
	npm install

npm_build:
	npx vite build	

# remove build dir
clean:
	rm -rf $(build_dir)
	

package: clean
	mkdir $(build_dir)
	mkdir $(build_src)
	mkdir $(build_src)/$(plugin_name)
	# Copy directories if they exist
	[ -d App ] && rsync -zah App $(build_src)/$(plugin_name)/ || true
	[ -d Attributes ] && rsync -zah Attributes $(build_src)/$(plugin_name)/ || true
	[ -d Controllers ] && rsync -zah Controllers $(build_src)/$(plugin_name)/ || true
	[ -d Migration ] && rsync -zah Migration $(build_src)/$(plugin_name)/ || true
	[ -d routes ] && rsync -zah routes $(build_src)/$(plugin_name)/ || true
	# Copy files if they exist
	[ -f $(root_dir)/plugin.xml ] && cp $(root_dir)/plugin.xml $(build_src)/$(plugin_name)/ || true
	[ -f $(dst_dir)/$(plugin_name).umd.js ] && cp $(dst_dir)/$(plugin_name).umd.js $(build_src)/$(plugin_name)/ || true
	[ -f $(root_dir)/CHANGELOG.md ] && cp $(root_dir)/CHANGELOG.md $(build_src)/$(plugin_name)/ || true
	mkdir -p $(build_src)/$(plugin_name)/js
	[ -f $(build_src)/$(plugin_name)/$(plugin_name).umd.js ] && mv $(build_src)/$(plugin_name)/$(plugin_name).umd.js $(build_src)/$(plugin_name)/js/script.js || true
	tar -czf $(build_dir)/$(plugin_name).tar.gz \
	   --directory="$(build_src)" $(plugin_name)
	(cd $(build_src) && zip ../$(plugin_name)_$(plugin_version).zip -r .)
	rm -rf $(build_src)
