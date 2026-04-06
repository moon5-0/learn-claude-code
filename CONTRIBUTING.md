# Contributing to Learn Claude Code

Thank you for your interest in contributing to Learn Claude Code! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Development Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git
- An Anthropic API key

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/learn-claude-code.git
   cd learn-claude-code
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install development dependencies:
   ```bash
   make dev
   # Or manually:
   pip install -e .[dev]
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear title and description
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (Python version, OS, etc.)

### Suggesting Enhancements

Open an issue with:
- A clear title and description
- Why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our development guidelines

3. Write or update tests as needed

4. Ensure all tests pass:
   ```bash
   make test
   ```

5. Format your code:
   ```bash
   make format
   ```

6. Commit your changes with a clear message:
   ```bash
   git commit -m "Add: brief description of changes"
   ```

7. Push to your fork and submit a pull request

## Development Guidelines

### Code Style

- Follow PEP 8 style guidelines
- Use Black for code formatting (line length: 100)
- Use isort for import sorting
- Use type hints where appropriate
- Write docstrings for public functions and classes

### Project Structure

```
learn-claude-code/
├── agents/           # Agent implementation files (s01-s12)
├── docs/             # Documentation files
├── mypackage/        # Core package modules
│   ├── tests/        # Unit tests
│   └── utils.py      # Utility functions
├── skills/           # Skill files for agent loading
├── web/              # Web interface
└── .tasks/           # Task management system
```

### Agent Sessions

Each session (s01-s12) builds on the previous one:
- s01: Basic agent loop
- s02: Tool use
- s03: Task planning
- s04: Subagent spawning
- s05: Skill loading
- s06: Context compression
- s07: Task system
- s08: Background tasks
- s09: Agent teams
- s10: Team protocols
- s11: Autonomous agents
- s12: Worktree isolation

When adding features, maintain this progressive structure.

## Testing

Run tests using pytest:

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run specific test file
pytest mypackage/tests/test_utils.py

# Run with verbose output
pytest -v
```

### Writing Tests

- Place tests in the appropriate `tests/` directory
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Test both success and failure cases

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:
- Use present tense ("Add feature" not "Added feature")
- Limit the first line to 72 characters
- Reference issues and pull requests when applicable

Format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- Add: New feature
- Fix: Bug fix
- Update: Changes to existing functionality
- Refactor: Code refactoring
- Test: Adding or updating tests
- Docs: Documentation changes
- Chore: Maintenance tasks

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests have been added or updated
- [ ] All tests pass
- [ ] Documentation has been updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] The PR addresses a single concern

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Check existing documentation in the `docs/` directory

Thank you for contributing! 🎉
