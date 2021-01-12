ANSIBLE_INSTALL_VERSION ?= 2.7.7
PATH := $(PWD)/.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin:$(shell printenv PATH)
SHELL := env PATH=$(PATH) /bin/bash

ifeq ($(SCENARIO), all)
SCENARIO_OPT = "--all"
else
SCENARIO_OPT = "--scenario-name=$(SCENARIO)"
endif

.DEFAULT_GOAL := help
.PHONY: all clean destroy help test



## Make deps, test
all: deps test

## Setup dependencies
deps: .venv_ansible$(ANSIBLE_INSTALL_VERSION)


## Activate the virtualenv
activate: .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	@echo -e "\033[0;32mINFO: Activating venv_ansible$(ANSIBLE_INSTALL_VERSION) (ctrl-d to exit)\033[0m"
	@exec $(SHELL) --init-file .venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/activate


## Destroy docker instances, remove virtualenv, molecule temp, .pyc files
clean: destroy
	rm -rf .venv_ansible*
	rm -rf molecule/*/.cache/
	rm -rf molecule/*/.molecule/
	find . -name "*.pyc" -exec rm {} \;


## Run 'molecule destroy'
destroy:
	@if [ -x .venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule ]; then \
		.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule destroy; \
	elif (which -s molecule); then \
		echo -e "\033[0;33mWARNING: molecule not found in virtualenv - trying to use molecule in PATH\033[0m"; \
		molecule destroy; \
	else \
		echo -e "\033[0;33mWARNING: molecule not found - either remove potential containers manually or run 'make deps' first\033[0m"; \
	fi


## Login to docker container named '%'
login_%: .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	@echo -e "\033[0;32mINFO: Logging into $(subst login_,,$@) (ctrl-d to exit)\033[0m"
	@.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule login --host $(subst login_,,$@)


## Run 'molecule test --destroy=never' (run 'make destroy' to destroy containers)
test: .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	@.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule test $(SCENARIO_OPT) --destroy=never


# shortcut for creating venv
.venv: .venv_ansible$(ANSIBLE_INSTALL_VERSION)


## Create virtualenv, install dependencies
.venv_ansible$(ANSIBLE_INSTALL_VERSION):
	@if (python -V 2>&1 | grep -qv "Python 2.7"); then \
		echo -e "\033[0;31mERROR: Only Python 2.7 is supported at this stage\033[0m"; \
		false; \
	fi
	virtualenv .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/pip install -r requirements.txt --ignore-installed
	.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/pip install ansible==$(ANSIBLE_INSTALL_VERSION)
	virtualenv --relocatable .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	@echo -e "\033[0;32mINFO: Run 'make activate' to activate the virtualenv for this shell\033[0m"


## Run 'make test' on any file change
watch: .venv_ansible$(ANSIBLE_INSTALL_VERSION)
	@while sleep 1; do \
		find defaults/ files/ handlers/ meta/ molecule/*/*.yml molecule/*/test/*.py tasks/ templates/ vars/ 2> /dev/null \
		| entr -d make test; \
	done


## Print this help
help:
	@awk -v skip=1 \
		'/^##/ { sub(/^[#[:blank:]]*/, "", $$0); doc_h=$$0; doc=""; skip=0; next } \
		 skip  { next } \
		 /^#/  { doc=doc "\n" substr($$0, 2); next } \
		 /:/   { sub(/:.*/, "", $$0); \
		 printf "\033[34m%-30s\033[0m\033[1m%s\033[0m %s\n\n", $$0, doc_h, doc; skip=1 }' \
		$(MAKEFILE_LIST)
