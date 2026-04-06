"""Tests for the utils module."""

import pytest

from mypackage.utils import add, multiply, greet, format_text, calculate


class TestAdd:
    """Tests for the add function."""

    def test_add_positive_numbers(self) -> None:
        """Test adding two positive numbers."""
        assert add(2, 3) == 5

    def test_add_negative_numbers(self) -> None:
        """Test adding two negative numbers."""
        assert add(-1, -1) == -2

    def test_add_zero(self) -> None:
        """Test adding zero."""
        assert add(5, 0) == 5


class TestMultiply:
    """Tests for the multiply function."""

    def test_multiply_positive_numbers(self) -> None:
        """Test multiplying two positive numbers."""
        assert multiply(3, 4) == 12

    def test_multiply_by_zero(self) -> None:
        """Test multiplying by zero."""
        assert multiply(5, 0) == 0

    def test_multiply_negative_numbers(self) -> None:
        """Test multiplying two negative numbers."""
        assert multiply(-2, 3) == -6


class TestGreet:
    """Tests for the greet function."""

    def test_greet_basic(self) -> None:
        """Test basic greeting."""
        assert greet("World") == "Hello, World!"

    def test_greet_name(self) -> None:
        """Test greeting with a name."""
        assert greet("Alice") == "Hello, Alice!"


class TestFormatText:
    """Tests for the format_text function."""

    def test_format_text_title(self) -> None:
        """Test title formatting."""
        assert format_text("hello world", "title") == "Hello World"

    def test_format_text_upper(self) -> None:
        """Test upper case formatting."""
        assert format_text("hello", "upper") == "HELLO"

    def test_format_text_lower(self) -> None:
        """Test lower case formatting."""
        assert format_text("HELLO", "lower") == "hello"

    def test_format_text_invalid(self) -> None:
        """Test invalid format type."""
        with pytest.raises(ValueError, match="Invalid format type"):
            format_text("test", "invalid")


class TestCalculate:
    """Tests for the calculate function."""

    def test_calculate_add(self) -> None:
        """Test addition operation."""
        assert calculate(5, 3, "add") == 8

    def test_calculate_subtract(self) -> None:
        """Test subtraction operation."""
        assert calculate(10, 4, "subtract") == 6

    def test_calculate_multiply(self) -> None:
        """Test multiplication operation."""
        assert calculate(6, 7, "multiply") == 42

    def test_calculate_divide(self) -> None:
        """Test division operation."""
        assert calculate(20, 4, "divide") == 5.0

    def test_calculate_divide_by_zero(self) -> None:
        """Test division by zero."""
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calculate(10, 0, "divide")

    def test_calculate_invalid_operation(self) -> None:
        """Test invalid operation."""
        with pytest.raises(ValueError, match="Invalid operation"):
            calculate(1, 2, "power")