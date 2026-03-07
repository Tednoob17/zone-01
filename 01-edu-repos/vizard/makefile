# Makefile for code formatting using Black

# -------- reusable macro --------
define run_black_cmd
ifndef el
	$(error "Please provide a file path using el=<file_path>")
else
	@echo "$(1) $(el)..." // file path
	@black $(2) $(el) // flag passed to black
	@echo "$(1) $(el) complete."
endif
endef

# -------- Global target --------
format-all:
	@echo "Formatting all source files..."
	@black .
	@echo "Formatting complete."

check-formatting-all:
	@echo "Checking code format..."
	@black --check . || true
	@echo "Format check complete."

get-formatting-status-all:
	@echo "Getting formatting status..."
	@black --diff --color .
	@echo "Formatting status complete."

# -------- Targeting a specific file --------
format-file:
	$(call run_black_cmd,Formatting,)

check-formatting-file:
	$(call run_black_cmd,Checking formatting,--check --color)

get-formatting-status-file:
	$(call run_black_cmd,Getting formatting status,--diff --color)

# -------- Clean all --------
clean-code: check-formatting-all get-formatting-status-all format-all
	@echo "Code cleaned and formatted, you can commit the changes now."

# --------- Serve documentation ---------
documentation:
	@mkdocs serve