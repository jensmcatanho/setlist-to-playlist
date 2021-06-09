.PHONY: build
build:
	docker build --no-cache -t jensmcatanho/setlist-to-playlist:base .
	docker compose build

.PHONY: run
run: build
	docker compose up