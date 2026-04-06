"""
Validation utilities for agent systems.

This module provides validators and error handling utilities for
ensuring data integrity and providing clear error messages.
"""

from typing import Any, Callable, Dict, List, Optional, Type, TypeVar, Union

T = TypeVar("T")


class ValidationError(Exception):
    """Raised when validation fails."""
    
    def __init__(self, message: str, field: Optional[str] = None):
        """
        Initialize the ValidationError.
        
        Args:
            message: The error message.
            field: The field that failed validation.
        """
        self.field = field
        super().__init__(f"{field}: {message}" if field else message)


class Validator:
    """
    Base validator class.
    
    Example:
        >>> validator = Validator()
        >>> value = validator.validate("test")
    """
    
    def validate(self, value: Any) -> Any:
        """
        Validate a value.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If validation fails.
        """
        return value


class RequiredValidator(Validator):
    """Validates that a value is not None or empty."""
    
    def validate(self, value: Any) -> Any:
        """
        Validate that a value is required.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If the value is None or empty.
        """
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError("This field is required")
        
        return super().validate(value)


class TypeValidator(Validator):
    """Validates that a value is of a specific type."""
    
    def __init__(self, expected_type: Type):
        """
        Initialize the TypeValidator.
        
        Args:
            expected_type: The expected type.
        """
        self.expected_type = expected_type
    
    def validate(self, value: Any) -> Any:
        """
        Validate the type of a value.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If the value is not of the expected type.
        """
        if not isinstance(value, self.expected_type):
            raise ValidationError(
                f"Expected type {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        
        return super().validate(value)


class RangeValidator(Validator):
    """Validates that a numeric value is within a range."""
    
    def __init__(
        self,
        min_value: Optional[Union[int, float]] = None,
        max_value: Optional[Union[int, float]] = None
    ):
        """
        Initialize the RangeValidator.
        
        Args:
            min_value: Minimum allowed value (inclusive).
            max_value: Maximum allowed value (inclusive).
        """
        self.min_value = min_value
        self.max_value = max_value
    
    def validate(self, value: Union[int, float]) -> Union[int, float]:
        """
        Validate that a value is within the range.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If the value is out of range.
        """
        if self.min_value is not None and value < self.min_value:
            raise ValidationError(
                f"Value must be >= {self.min_value}, got {value}"
            )
        
        if self.max_value is not None and value > self.max_value:
            raise ValidationError(
                f"Value must be <= {self.max_value}, got {value}"
            )
        
        return super().validate(value)


class ChoiceValidator(Validator):
    """Validates that a value is in a set of choices."""
    
    def __init__(self, choices: List[Any], case_sensitive: bool = True):
        """
        Initialize the ChoiceValidator.
        
        Args:
            choices: List of allowed values.
            case_sensitive: Whether string comparison should be case-sensitive.
        """
        self.choices = choices
        self.case_sensitive = case_sensitive
    
    def validate(self, value: Any) -> Any:
        """
        Validate that a value is in the allowed choices.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If the value is not in the choices.
        """
        if self.case_sensitive:
            if value not in self.choices:
                raise ValidationError(
                    f"Value must be one of {self.choices}, got {value}"
                )
        else:
            if isinstance(value, str):
                if value.lower() not in [c.lower() for c in self.choices]:
                    raise ValidationError(
                        f"Value must be one of {self.choices}, got {value}"
                    )
        
        return super().validate(value)


class ChainValidator(Validator):
    """Chains multiple validators together."""
    
    def __init__(self, validators: List[Validator]):
        """
        Initialize the ChainValidator.
        
        Args:
            validators: List of validators to chain.
        """
        self.validators = validators
    
    def validate(self, value: Any) -> Any:
        """
        Validate using all chained validators.
        
        Args:
            value: The value to validate.
            
        Returns:
            The validated value.
            
        Raises:
            ValidationError: If any validator fails.
        """
        for validator in self.validators:
            value = validator.validate(value)
        
        return value


class SchemaValidator(Validator):
    """Validates a dictionary against a schema."""
    
    def __init__(self, schema: Dict[str, Validator], allow_extra: bool = True):
        """
        Initialize the SchemaValidator.
        
        Args:
            schema: Dictionary mapping field names to validators.
            allow_extra: Whether to allow extra fields not in the schema.
        """
        self.schema = schema
        self.allow_extra = allow_extra
    
    def validate(self, value: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a dictionary against the schema.
        
        Args:
            value: The dictionary to validate.
            
        Returns:
            The validated dictionary.
            
        Raises:
            ValidationError: If validation fails.
        """
        if not isinstance(value, dict):
            raise ValidationError(f"Expected dict, got {type(value).__name__}")
        
        # Check for required fields
        for field, validator in self.schema.items():
            if field not in value:
                if isinstance(validator, ChainValidator):
                    for v in validator.validators:
                        if isinstance(v, RequiredValidator):
                            raise ValidationError(
                                f"Missing required field: {field}"
                            )
        
        # Validate each field
        result = {}
        for field, field_value in value.items():
            if field in self.schema:
                try:
                    result[field] = self.schema[field].validate(field_value)
                except ValidationError as e:
                    raise ValidationError(str(e), field=field)
            elif self.allow_extra:
                result[field] = field_value
            else:
                raise ValidationError(f"Unknown field: {field}")
        
        return result


def validate_required(value: Any) -> Any:
    """Validate that a value is required."""
    return RequiredValidator().validate(value)


def validate_type(value: Any, expected_type: Type) -> Any:
    """Validate the type of a value."""
    return TypeValidator(expected_type).validate(value)


def validate_range(
    value: Union[int, float],
    min_value: Optional[Union[int, float]] = None,
    max_value: Optional[Union[int, float]] = None
) -> Union[int, float]:
    """Validate that a value is within a range."""
    return RangeValidator(min_value, max_value).validate(value)


def validate_choice(value: Any, choices: List[Any], case_sensitive: bool = True) -> Any:
    """Validate that a value is in a set of choices."""
    return ChoiceValidator(choices, case_sensitive).validate(value)


def validate_schema(
    value: Dict[str, Any],
    schema: Dict[str, Validator],
    allow_extra: bool = True
) -> Dict[str, Any]:
    """Validate a dictionary against a schema."""
    return SchemaValidator(schema, allow_extra).validate(value)
