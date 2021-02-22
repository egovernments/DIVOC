ANSIBLE_INSTALL_VERSION ?= 2.7.6
PATH := $(PWD)/.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin:$(shell printenv PATH)
SHELL := env PATH=$(PATH) /bin/bash

.DEFAULT_GOAL := help
.PHONY: all clean destroy help test


_check_venv:
	@if [ ! -e .venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/activate ]; then \
	 	echo -e "\033[0;31mERROR: No virtualenv found - run 'make deps' first\033[0m"; \
		false; \
	fi


## Make deps, test
all: deps test


## Activate the virtualenv
activate: _check_venv
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
login_%: _check_venv
	@echo -e "\033[0;32mINFO: Logging into $(subst login_,,$@) (ctrl-d to exit)\033[0m"
	@.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule login --host $(subst login_,,$@)

## Run 'molecule test --destroy=never' (run 'make destroy' to destroy containers)
test: _check_venv
	@.venv_ansible$(ANSIBLE_INSTALL_VERSION)/bin/molecule test --destroy=never


## Create virtualenv, install dependencies
deps:
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
watch: _check_venv
	@while sleep 1; do \
		find defaults/ files/ handlers/ meta/ molecule/*/*.yml molecule/*/test/*.py tasks/ templates/ vars/ 2> /dev/null \
		| entr -d make test; \
	done


help:
	@awk -v skip=1 \
		'/^##/ { sub(/^[#[:blank:]]*/, "", $$0); doc_h=$$0; doc=""; skip=0; next } \
		 skip  { next } \
		 /^#/  { doc=doc "\n" substr($$0, 2); next } \
		 /:/   { sub(/:.*/, "", $$0); \
		 printf "\033[34m%-30s\033[0m\033[1m%s\033[0m %s\n\n", $$0, doc_h, doc; skip=1 }' \
		$(MAKEFILE_LIST)
