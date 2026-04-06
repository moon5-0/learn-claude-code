.PHONY: help install dev test lint format clean run demo

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install base dependencies
	pip install -r requirements.txt

dev: ## Install development dependencies
	pip install -e .[dev]

test: ## Run tests
	pytest

test-cov: ## Run tests with coverage
	pytest --cov=agents --cov=mypackage --cov-report=html --cov-report=term

lint: ## Run linting checks
	flake8 agents mypackage
	mypy agents mypackage

format: ## Format code with black and isort
	black agents mypackage
	isort agents mypackage

format-check: ## Check code formatting
	black --check agents mypackage
	isort --check-only agents mypackage

clean: ## Remove cached files
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov .coverage

run: ## Run the main agent demo
	python agents/s01_agent_loop.py

demo: ## Run the full agent system
	python agents/s_full.py

web: ## Start the web development server
	cd web && npm install && npm run dev

build: ## Build the package
	python -m build

publish: ## Publish to PyPI (requires credentials)
	twine upload dist/*
