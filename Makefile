.PHONY: check test

NODE_TEST := node --import ./test/sdk-loader.mjs

check:
	@if [ -z "$(PI_CACHE_STATS_TEST_SDK)" ] && [ ! -d node_modules/@earendil-works/pi-coding-agent ]; then echo "ERROR: set PI_CACHE_STATS_TEST_SDK=/path/to/@earendil-works/pi-coding-agent (no local node_modules in clean clone)" >&2; exit 1; fi
	node --check extensions/cache-stats.ts
	$(NODE_TEST) test/cache-stats.mjs
	$(NODE_TEST) test/hit-rate.mjs
	$(NODE_TEST) test/agent-session.mjs
	$(NODE_TEST) test/comparison.mjs
	$(NODE_TEST) test/prefix-diagnostics.mjs
	$(NODE_TEST) test/prefix-r9-accessors.mjs
	$(NODE_TEST) test/prefix-r9-endpoint.mjs
	$(NODE_TEST) test/prefix-r9-budget.mjs
	$(NODE_TEST) test/prefix-r11-extras.mjs
	$(NODE_TEST) test/prefix-r11-extras-perf.mjs
	$(NODE_TEST) test/prefix-r11-scope.mjs
	$(NODE_TEST) test/prefix-r11-structure.mjs
	$(NODE_TEST) test/prefix-r11-notify.mjs
	$(NODE_TEST) test/prefix-r12-a1-tags.mjs
	$(NODE_TEST) test/prefix-r12-a2-order.mjs
	$(NODE_TEST) test/prefix-r12-b1-shape.mjs
	$(NODE_TEST) test/prefix-r12-b2-mixed.mjs
	$(NODE_TEST) test/prefix-r14-f1-content.mjs
	$(NODE_TEST) test/prefix-r14-f1-tools.mjs

test: check
