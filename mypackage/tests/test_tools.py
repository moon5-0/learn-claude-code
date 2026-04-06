"""Unit tests for tools module."""

import pytest
from typing import Dict, Any

from mypackage.tools import (
    ToolHandler,
    ToolRegistry,
    FunctionToolHandler,
    create_function_tool,
)


class MockToolHandler(ToolHandler):
    """Mock tool handler for testing."""
    
    @property
    def name(self) -> str:
        return "mock_tool"
    
    @property
    def description(self) -> str:
        return "A mock tool for testing"
    
    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "input": {"type": "string"}
            },
            "required": ["input"]
        }
    
    def execute(self, input: str) -> str:
        return f"Processed: {input}"


class TestToolHandler:
    """Tests for ToolHandler abstract class."""
    
    def test_to_tool_spec(self):
        """Test converting handler to tool specification."""
        handler = MockToolHandler()
        spec = handler.to_tool_spec()
        
        assert spec["name"] == "mock_tool"
        assert spec["description"] == "A mock tool for testing"
        assert "input_schema" in spec
        assert spec["input_schema"]["type"] == "object"
    
    def test_execute(self):
        """Test executing tool."""
        handler = MockToolHandler()
        result = handler.execute(input="test")
        
        assert result == "Processed: test"


class TestToolRegistry:
    """Tests for ToolRegistry class."""
    
    def test_register_tool(self):
        """Test registering a tool."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        
        assert registry.has_tool("mock_tool")
        assert len(registry) == 1
    
    def test_register_duplicate_tool(self):
        """Test registering a duplicate tool."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        
        with pytest.raises(ValueError, match="already registered"):
            registry.register(handler)
    
    def test_unregister_tool(self):
        """Test unregistering a tool."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        removed = registry.unregister("mock_tool")
        
        assert removed == handler
        assert not registry.has_tool("mock_tool")
    
    def test_unregister_nonexistent_tool(self):
        """Test unregistering a nonexistent tool."""
        registry = ToolRegistry()
        result = registry.unregister("nonexistent")
        
        assert result is None
    
    def test_get_tool(self):
        """Test getting a tool by name."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        retrieved = registry.get_tool("mock_tool")
        
        assert retrieved == handler
    
    def test_get_nonexistent_tool(self):
        """Test getting a nonexistent tool."""
        registry = ToolRegistry()
        result = registry.get_tool("nonexistent")
        
        assert result is None
    
    def test_get_tools(self):
        """Test getting all tool specifications."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        tools = registry.get_tools()
        
        assert len(tools) == 1
        assert tools[0]["name"] == "mock_tool"
    
    def test_get_tool_names(self):
        """Test getting all tool names."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        names = registry.get_tool_names()
        
        assert names == ["mock_tool"]
    
    def test_execute_tool(self):
        """Test executing a tool by name."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        result = registry.execute("mock_tool", input="test")
        
        assert result == "Processed: test"
    
    def test_execute_nonexistent_tool(self):
        """Test executing a nonexistent tool."""
        registry = ToolRegistry()
        
        with pytest.raises(KeyError, match="not found"):
            registry.execute("nonexistent", input="test")
    
    def test_clear(self):
        """Test clearing all tools."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        registry.clear()
        
        assert len(registry) == 0
    
    def test_contains(self):
        """Test checking if tool exists."""
        registry = ToolRegistry()
        handler = MockToolHandler()
        
        registry.register(handler)
        
        assert "mock_tool" in registry
        assert "nonexistent" not in registry


class TestFunctionToolHandler:
    """Tests for FunctionToolHandler class."""
    
    def test_basic_function(self):
        """Test with a basic function."""
        def add(a: int, b: int) -> int:
            return a + b
        
        handler = FunctionToolHandler(
            name="add",
            description="Add two numbers",
            func=add,
            parameters={
                "type": "object",
                "properties": {
                    "a": {"type": "integer"},
                    "b": {"type": "integer"}
                },
                "required": ["a", "b"]
            }
        )
        
        assert handler.name == "add"
        assert handler.description == "Add two numbers"
        assert handler.execute(a=5, b=3) == 8
    
    def test_to_tool_spec(self):
        """Test converting to tool specification."""
        def dummy(x: str) -> str:
            return x
        
        handler = FunctionToolHandler(
            name="dummy",
            description="A dummy function",
            func=dummy,
            parameters={"type": "object", "properties": {}}
        )
        
        spec = handler.to_tool_spec()
        
        assert spec["name"] == "dummy"
        assert spec["description"] == "A dummy function"
        assert "input_schema" in spec


class TestCreateFunctionTool:
    """Tests for create_function_tool decorator."""
    
    def test_decorator(self):
        """Test the decorator."""
        @create_function_tool(
            name="multiply",
            description="Multiply two numbers",
            parameters={
                "type": "object",
                "properties": {
                    "a": {"type": "integer"},
                    "b": {"type": "integer"}
                },
                "required": ["a", "b"]
            }
        )
        def multiply(a: int, b: int) -> int:
            return a * b
        
        assert isinstance(multiply, FunctionToolHandler)
        assert multiply.name == "multiply"
        assert multiply.execute(a=4, b=7) == 28
