"""Tests for the utils module."""

import pytest

from mypackage.utils import add, multiply, greet


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