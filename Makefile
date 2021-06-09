.PHONY: build
build:
	docker build --tag jensmcatanho/setlist-to-playlist:base .
	docker compose build

.PHONY: run
run: clean build
	docker compose up --detach

.PHONY: clean
clean:
	docker compose down --remove-orphans