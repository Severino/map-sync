root_dir=.
lib_dir=./lib
dst_dir=./dist
build_dir=./build
build_src=./build/src
package_name=$(shell node -p -e "require('./package.json').name")
package_root=$(shell node -p -e "require('./package.json').pluginName")

# all steps for an appstore release
release: npm_init npm_build package

prebuild_release: clean package

npm_init:
	npm install

npm_build:
	npx vite build	
#./node_modules/.bin/vue-cli-service build --target lib --name $(package_name) ./src/main.js --mode production

# remove build dir
clean:
	rm -rf $(build_dir)
	

package: clean
	mkdir $(build_dir)
	mkdir $(build_src)
	mkdir $(build_src)/$(package_root)
	# Copy directories if they exist
	[ -d App ] && rsync -zah App $(build_src)/$(package_root)/ || true
	[ -d Attributes ] && rsync -zah Attributes $(build_src)/$(package_root)/ || true
	[ -d Controllers ] && rsync -zah Controllers $(build_src)/$(package_root)/ || true
	[ -d Migration ] && rsync -zah Migration $(build_src)/$(package_root)/ || true
	[ -d routes ] && rsync -zah routes $(build_src)/$(package_root)/ || true
	# Copy files if they exist
	[ -f $(dst_dir)/$(package_name).umd.js ] && cp $(dst_dir)/$(package_name).umd.js $(build_src)/$(package_root)/ || true
	[ -f $(root_dir)/CHANGELOG.md ] && cp $(root_dir)/CHANGELOG.md $(build_src)/$(package_root)/ || true
	mkdir -p $(build_src)/$(package_root)/js
	[ -f $(build_src)/$(package_root)/$(package_name).umd.js ] && mv $(build_src)/$(package_root)/$(package_name).umd.js $(build_src)/$(package_root)/js/script.js || true
	tar -czf $(build_dir)/$(package_name).tar.gz \
	   --directory="$(build_src)" $(package_root)
	(cd $(build_src) && zip ../$(package_name).zip -r .)
	rm -rf $(build_src)
