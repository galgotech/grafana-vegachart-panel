.PHONY: all deps build


all: deps build

deps: node_modules

node_modules: package.json yarn.lock ## Install node modules.
	@echo "install plugins dependencies"
	yarn install --pure-lockfile --no-progress
	
build: ## Build plugin assets.
	@echo "build grafana-vechart-panel"
	yarn run build
	
clean:
	rm -rf node_modules
	rm -rf ./dist
