"""
Response parsing utilities for Claude API responses.

This module provides utilities for parsing and extracting information
from Claude API responses.
"""

from typing import Any, Dict, List, Optional, Union


class ResponseParser:
    """
    Parser for Claude API responses.
    
    Provides utility methods for extracting information from
    different types of response content.
    
    Example:
        >>> parser = ResponseParser(response)
        >>> text = parser.get_text()
        >>> tool_uses = parser.get_tool_uses()
        >>> stop_reason = parser.get_stop_reason()
    """
    
    def __init__(self, response: Any):
        """
        Initialize the ResponseParser.
        
        Args:
            response: The Claude API response object.
        """
        self.response = response
    
    def get_stop_reason(self) -> str:
        """
        Get the stop reason from the response.
        
        Returns:
            The stop reason (e.g., "end_turn", "tool_use", "max_tokens").
        """
        return getattr(self.response, "stop_reason", "end_turn")
    
    def get_content_blocks(self) -> List[Any]:
        """
        Get all content blocks from the response.
        
        Returns:
            List of content blocks.
        """
        return getattr(self.response, "content", [])
    
    def get_text_blocks(self) -> List[str]:
        """
        Get all text blocks from the response.
        
        Returns:
            List of text strings.
        """
        texts = []
        for block in self.get_content_blocks():
            if hasattr(block, "type") and block.type == "text":
                texts.append(getattr(block, "text", ""))
        
        return texts
    
    def get_text(self) -> str:
        """
        Get the combined text from all text blocks.
        
        Returns:
            Combined text string.
        """
        return "\n\n".join(self.get_text_blocks())
    
    def get_tool_uses(self) -> List[Dict[str, Any]]:
        """
        Get all tool use blocks from the response.
        
        Returns:
            List of tool use dictionaries with name, id, and input.
        """
        tool_uses = []
        for block in self.get_content_blocks():
            if hasattr(block, "type") and block.type == "tool_use":
                tool_uses.append({
                    "id": getattr(block, "id", ""),
                    "name": getattr(block, "name", ""),
                    "input": getattr(block, "input", {}),
                })
        
        return tool_uses
    
    def has_tool_use(self) -> bool:
        """
        Check if the response contains tool use blocks.
        
        Returns:
            True if there are tool use blocks, False otherwise.
        """
        return self.get_stop_reason() == "tool_use" and len(self.get_tool_uses()) > 0
    
    def get_tool_names(self) -> List[str]:
        """
        Get the names of all tools used in the response.
        
        Returns:
            List of tool names.
        """
        return [tool["name"] for tool in self.get_tool_uses()]
    
    def get_usage(self) -> Dict[str, int]:
        """
        Get the token usage from the response.
        
        Returns:
            Dictionary with input_tokens and output_tokens.
        """
        usage = getattr(self.response, "usage", None)
        if usage:
            return {
                "input_tokens": getattr(usage, "input_tokens", 0),
                "output_tokens": getattr(usage, "output_tokens", 0),
            }
        
        return {"input_tokens": 0, "output_tokens": 0}
    
    def get_total_tokens(self) -> int:
        """
        Get the total tokens used in the response.
        
        Returns:
            Total number of tokens.
        """
        usage = self.get_usage()
        return usage["input_tokens"] + usage["output_tokens"]
    
    def get_model(self) -> str:
        """
        Get the model used for the response.
        
        Returns:
            The model name.
        """
        return getattr(self.response, "model", "")
    
    def get_role(self) -> str:
        """
        Get the role of the response.
        
        Returns:
            The role (e.g., "assistant").
        """
        return getattr(self.response, "role", "assistant")
    
    def to_message(self) -> Dict[str, Any]:
        """
        Convert the response to a message format for the conversation history.
        
        Returns:
            Message dictionary with role and content.
        """
        return {
            "role": self.get_role(),
            "content": self.get_content_blocks(),
        }
    
    def is_max_tokens(self) -> bool:
        """
        Check if the response was truncated due to max tokens.
        
        Returns:
            True if max_tokens stop reason, False otherwise.
        """
        return self.get_stop_reason() == "max_tokens"
    
    def needs_continuation(self) -> bool:
        """
        Check if the response needs continuation.
        
        Returns:
            True if the response should be continued, False otherwise.
        """
        return self.get_stop_reason() in ["max_tokens"]


def create_tool_result(
    tool_use_id: str,
    content: Union[str, Dict[str, Any], List[Any]],
    is_error: bool = False
) -> Dict[str, Any]:
    """
    Create a tool result block.
    
    Args:
        tool_use_id: The ID of the tool use block.
        content: The result content.
        is_error: Whether this is an error result.
        
    Returns:
        Tool result dictionary.
        
    Example:
        >>> result = create_tool_result("tool_123", "File contents here")
        >>> result = create_tool_result("tool_456", {"error": "Not found"}, is_error=True)
    """
    return {
        "type": "tool_result",
        "tool_use_id": tool_use_id,
        "content": content,
        "is_error": is_error,
    }


def create_user_message(content: Union[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Create a user message.
    
    Args:
        content: The message content (string or list of content blocks).
        
    Returns:
        Message dictionary.
        
    Example:
        >>> msg = create_user_message("Hello!")
        >>> msg = create_user_message([{"type": "text", "text": "Hello!"}])
    """
    if isinstance(content, str):
        content = [{"type": "text", "text": content}]
    
    return {"role": "user", "content": content}


def create_assistant_message(
    content: Union[str, List[Any]]
) -> Dict[str, Any]:
    """
    Create an assistant message.
    
    Args:
        content: The message content (string or list of content blocks).
        
    Returns:
        Message dictionary.
        
    Example:
        >>> msg = create_assistant_message("Hi there!")
        >>> msg = create_assistant_message([{"type": "text", "text": "Hi!"}])
    """
    if isinstance(content, str):
        content = [{"type": "text", "text": content}]
    
    return {"role": "assistant", "content": content}


def extract_text_from_message(message: Dict[str, Any]) -> str:
    """
    Extract text from a message.
    
    Args:
        message: Message dictionary.
        
    Returns:
        Extracted text.
    """
    content = message.get("content", "")
    
    if isinstance(content, str):
        return content
    
    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                texts.append(block.get("text", ""))
        
        return "\n".join(texts)
    
    return ""
