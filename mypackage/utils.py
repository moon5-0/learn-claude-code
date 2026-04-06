"""Utility functions for the mypackage."""


def add(a: int, b: int) -> int:
    """Add two integers together.

    Args:
        a: First integer.
        b: Second integer.

    Returns:
        The sum of a and b.
    """
    return a + b


def multiply(a: int, b: int) -> int:
    """Multiply two integers together.

    Args:
        a: First integer.
        b: Second integer.

    Returns:
        The product of a and b.
    """
    return a * b


def greet(name: str) -> str:
    """Generate a greeting message.

    Args:
        name: The name to greet.

    Returns:
        A greeting string.
    """
    return f"Hello, {name}!"


def format_text(text: str, format_type: str = "title") -> str:
    """
    Format text based on the specified format type.
    
    Args:
        text: The text to format.
        format_type: The format type ('title', 'upper', 'lower').
        
    Returns:
        The formatted text.
        
    Raises:
        ValueError: If an invalid format type is provided.
    """
    format_type = format_type.lower()
    
    if format_type == "title":
        return text.title()
    elif format_type == "upper":
        return text.upper()
    elif format_type == "lower":
        return text.lower()
    else:
        raise ValueError(f"Invalid format type: {format_type}")


def calculate(a: float, b: float, operation: str = "add") -> float:
    """
    Perform a basic calculation on two numbers.
    
    Args:
        a: First number.
        b: Second number.
        operation: The operation to perform ('add', 'subtract', 'multiply', 'divide').
        
    Returns:
        The result of the calculation.
        
    Raises:
        ValueError: If an invalid operation is provided or division by zero.
    """
    operation = operation.lower()
    
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
    else:
        raise ValueError(f"Invalid operation: {operation}")