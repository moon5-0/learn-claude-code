"""
Tool handler registry and base classes.

This module provides the infrastructure for registering and managing
tools that agents can use to interact with their environment.
"""

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Type


class ToolHandler(ABC):
    """
    Abstract base class for tool handlers.
    
    All tool handlers must implement the execute method.
    
    Example:
        >>> class ReadFileTool(ToolHandler):
        ...     @property
        ...     def name(self):
        ...         return "read_file"
        ...     
        ...     @property
        ...     def description(self):
        ...         return "Read contents from a file"
        ...     
        ...     @property
        ...     def parameters(self):
        ...         return {
        ...             "type": "object",
        ...             "properties": {
        ...                 "path": {"type": "string"}
        ...             },
        ...             "required": ["path"]
        ...         }
        ...     
        ...     def execute(self, path: str) -> str:
        ...         with open(path) as f:
        ...             return f.read()
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Get the tool name.
        
        Returns:
            The tool name.
        """
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """
        Get the tool description.
        
        Returns:
            The tool description.
        """
        pass
    
    @property
    @abstractmethod
    def parameters(self) -> Dict[str, Any]:
        """
        Get the tool parameters schema.
        
        Returns:
            JSON Schema for the parameters.
        """
        pass
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        """
        Execute the tool with the given parameters.
        
        Args:
            **kwargs: Tool parameters.
            
        Returns:
            The tool execution result.
        """
        pass
    
    def to_tool_spec(self) -> Dict[str, Any]:
        """
        Convert the handler to an Anthropic tool specification.
        
        Returns:
            The tool specification dictionary.
        """
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.parameters,
        }


class ToolRegistry:
    """
    Registry for managing tool handlers.
    
    Attributes:
        tools (Dict[str, ToolHandler]): Registered tools.
    
    Example:
        >>> registry = ToolRegistry()
        >>> registry.register(ReadFileTool())
        >>> tools = registry.get_tools()
        >>> result = registry.execute("read_file", path="example.txt")
    """
    
    def __init__(self):
        """Initialize the ToolRegistry."""
        self._tools: Dict[str, ToolHandler] = {}
    
    def register(self, handler: ToolHandler) -> None:
        """
        Register a tool handler.
        
        Args:
            handler: The tool handler to register.
            
        Raises:
            ValueError: If a tool with the same name is already registered.
        """
        if handler.name in self._tools:
            raise ValueError(f"Tool '{handler.name}' is already registered")
        
        self._tools[handler.name] = handler
    
    def unregister(self, name: str) -> Optional[ToolHandler]:
        """
        Unregister a tool by name.
        
        Args:
            name: The tool name.
            
        Returns:
            The unregistered handler, or None if not found.
        """
        return self._tools.pop(name, None)
    
    def get_tool(self, name: str) -> Optional[ToolHandler]:
        """
        Get a tool handler by name.
        
        Args:
            name: The tool name.
            
        Returns:
            The tool handler, or None if not found.
        """
        return self._tools.get(name)
    
    def get_tools(self) -> List[Dict[str, Any]]:
        """
        Get all registered tools as Anthropic tool specifications.
        
        Returns:
            List of tool specifications.
        """
        return [handler.to_tool_spec() for handler in self._tools.values()]
    
    def get_tool_names(self) -> List[str]:
        """
        Get all registered tool names.
        
        Returns:
            List of tool names.
        """
        return list(self._tools.keys())
    
    def execute(self, name: str, **kwargs) -> Any:
        """
        Execute a tool by name.
        
        Args:
            name: The tool name.
            **kwargs: Tool parameters.
            
        Returns:
            The tool execution result.
            
        Raises:
            KeyError: If the tool is not registered.
        """
        handler = self._tools.get(name)
        if not handler:
            raise KeyError(f"Tool '{name}' not found")
        
        return handler.execute(**kwargs)
    
    def has_tool(self, name: str) -> bool:
        """
        Check if a tool is registered.
        
        Args:
            name: The tool name.
            
        Returns:
            True if the tool is registered, False otherwise.
        """
        return name in self._tools
    
    def clear(self) -> None:
        """Remove all registered tools."""
        self._tools.clear()
    
    def __len__(self) -> int:
        """Get the number of registered tools."""
        return len(self._tools)
    
    def __contains__(self, name: str) -> bool:
        """Check if a tool is registered."""
        return name in self._tools


class FunctionToolHandler(ToolHandler):
    """
    A tool handler that wraps a function.
    
    Example:
        >>> def read_file(path: str) -> str:
        ...     with open(path) as f:
        ...         return f.read()
        ... 
        >>> handler = FunctionToolHandler(
        ...     name="read_file",
        ...     description="Read file contents",
        ...     func=read_file,
        ...     parameters={
        ...         "type": "object",
        ...         "properties": {"path": {"type": "string"}},
        ...         "required": ["path"]
        ...     }
        ... )
    """
    
    def __init__(
        self,
        name: str,
        description: str,
        func: Callable,
        parameters: Dict[str, Any]
    ):
        """
        Initialize the FunctionToolHandler.
        
        Args:
            name: Tool name.
            description: Tool description.
            func: The function to execute.
            parameters: JSON Schema for parameters.
        """
        self._name = name
        self._description = description
        self._func = func
        self._parameters = parameters
    
    @property
    def name(self) -> str:
        """Get the tool name."""
        return self._name
    
    @property
    def description(self) -> str:
        """Get the tool description."""
        return self._description
    
    @property
    def parameters(self) -> Dict[str, Any]:
        """Get the tool parameters schema."""
        return self._parameters
    
    def execute(self, **kwargs) -> Any:
        """Execute the tool."""
        return self._func(**kwargs)


def create_function_tool(
    name: str,
    description: str,
    parameters: Dict[str, Any]
) -> Callable:
    """
    Decorator to create a FunctionToolHandler from a function.
    
    Args:
        name: Tool name.
        description: Tool description.
        parameters: JSON Schema for parameters.
        
    Returns:
        A decorator that creates a FunctionToolHandler.
    
    Example:
        >>> @create_function_tool(
        ...     name="read_file",
        ...     description="Read file contents",
        ...     parameters={
        ...         "type": "object",
        ...         "properties": {"path": {"type": "string"}},
        ...         "required": ["path"]
        ...     }
        ... )
        ... def read_file(path: str) -> str:
        ...     with open(path) as f:
        ...         return f.read()
    """
    def decorator(func: Callable) -> FunctionToolHandler:
        return FunctionToolHandler(
            name=name,
            description=description,
            func=func,
            parameters=parameters
        )
    
    return decorator
