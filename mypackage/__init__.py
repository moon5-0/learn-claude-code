"""
MyPackage - Core utilities for agent harness systems.

This package provides essential utilities for building agent harnesses:
- Configuration management
- Tool handling and registry
- Input validation
- Response parsing
- Logging utilities
"""

from mypackage.config import (
    AgentConfig,
    Config,
    create_agent_config,
    create_config,
)
from mypackage.logger import Logger
from mypackage.response_parser import (
    ResponseParser,
    create_assistant_message,
    create_tool_result,
    create_user_message,
    extract_text_from_message,
)
from mypackage.tools import (
    FunctionToolHandler,
    ToolHandler,
    ToolRegistry,
    create_function_tool,
)
from mypackage.utils import add, calculate, format_text, greet, multiply

__all__ = [
    # Configuration
    "Config",
    "AgentConfig",
    "create_config",
    "create_agent_config",
    # Logging
    "Logger",
    # Tools
    "ToolHandler",
    "ToolRegistry",
    "FunctionToolHandler",
    "create_function_tool",
    # Validation
    # (import validators directly when needed)
    # Response parsing
    "ResponseParser",
    "create_tool_result",
    "create_user_message",
    "create_assistant_message",
    "extract_text_from_message",
    # Utils
    "add",
    "multiply",
    "greet",
    "format_text",
    "calculate",
]

__version__ = "1.0.0"
