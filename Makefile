#
# This source code is the confidential, propietary information of
# Answering, you may not disclose such information,
# and may only use it in accordance with the terms of the license
# agreement you entered into with Answering.
#
# 2023: Answering.
# All Rights Reserved.
#

.ONESHELL:

DOCKER_IMAGE=node:20.6.1-slim

vault:
	echo "${ANSIBLE_VAULT}" > ansible.vault
	chmod -x ansible.vault
    
lint:
	yamllint .
	cfn-lint *.yml

encrypt: vault
	@echo 'Encrypting "$(value)"'
	ansible-vault encrypt_string --vault-password-file ansible.vault $(value)

docker_bash:
	docker run -it --rm -v $(shell pwd):/src -w /src $(DOCKER_IMAGE) bash

development:
	cd bin
	yarn install
	yarn env:dev
	yarn cdk synth
    yarn cdk bootstrap
	yarn cdk deploy "dev-Answering*" --require-approval never 