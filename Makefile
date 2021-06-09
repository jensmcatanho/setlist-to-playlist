.PHONY: run
run:
	docker build --no-cache -t jensmcatanho/setlist-to-playlist:base .
	docker compose up