"""
Configuration management for agent harness.

This module provides utilities for loading and managing configuration
settings for agent systems.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


class Config:
    """
    A configuration manager that supports environment variables and JSON files.
    
    Attributes:
        config_dir (Path): Directory containing configuration files.
        env_prefix (str): Prefix for environment variables.
    
    Example:
        >>> config = Config()
        >>> api_key = config.get("ANTHROPIC_API_KEY")
        >>> model = config.get("model", default="claude-3-5-sonnet-20241022")
    """
    
    def __init__(self, config_dir: Optional[str] = None, env_prefix: str = ""):
        """
        Initialize the Config instance.
        
        Args:
            config_dir: Directory containing configuration files.
            env_prefix: Prefix for environment variables.
        """
        self.config_dir = Path(config_dir) if config_dir else Path.cwd()
        self.env_prefix = env_prefix
        self._config: Dict[str, Any] = {}
        self._loaded = False
        
        # Load .env file if python-dotenv is available
        if load_dotenv:
            load_dotenv(self.config_dir / ".env")
    
    def load_json(self, filename: str = "config.json") -> Dict[str, Any]:
        """
        Load configuration from a JSON file.
        
        Args:
            filename: Name of the JSON configuration file.
            
        Returns:
            The loaded configuration dictionary.
            
        Raises:
            FileNotFoundError: If the config file doesn't exist.
            json.JSONDecodeError: If the file is not valid JSON.
        """
        config_path = self.config_dir / filename
        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        with open(config_path) as f:
            self._config.update(json.load(f))
        
        self._loaded = True
        return self._config
    
    def get(self, key: str, default: Any = None, use_env: bool = True) -> Any:
        """
        Get a configuration value.
        
        Precedence order:
        1. Environment variable (if use_env is True)
        2. Loaded JSON config
        3. Default value
        
        Args:
            key: Configuration key.
            default: Default value if not found.
            use_env: Whether to check environment variables.
            
        Returns:
            The configuration value.
        """
        # Check environment variable first (with prefix)
        if use_env:
            env_key = f"{self.env_prefix}{key}"
            value = os.getenv(env_key)
            if value is not None:
                return value
        
        # Check loaded config
        if key in self._config:
            return self._config[key]
        
        return default
    
    def set(self, key: str, value: Any) -> None:
        """
        Set a configuration value in memory.
        
        Args:
            key: Configuration key.
            value: Configuration value.
        """
        self._config[key] = value
    
    def get_all(self) -> Dict[str, Any]:
        """
        Get all configuration values.
        
        Returns:
            Dictionary of all configuration values.
        """
        return self._config.copy()
    
    def clear(self) -> None:
        """Clear all in-memory configuration values."""
        self._config.clear()
        self._loaded = False


class AgentConfig(Config):
    """
    Specialized configuration for Claude Code agents.
    
    Provides default configuration values and convenient accessors
    for common agent settings.
    
    Example:
        >>> config = AgentConfig()
        >>> model = config.model
        >>> max_tokens = config.max_tokens
    """
    
    DEFAULTS = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 4096,
        "temperature": 1.0,
        "system_prompt": "You are a helpful AI assistant.",
    }
    
    def __init__(self, config_dir: Optional[str] = None):
        """
        Initialize the AgentConfig with defaults.
        
        Args:
            config_dir: Directory containing configuration files.
        """
        super().__init__(config_dir, env_prefix="ANTHROPIC_")
        
        # Set defaults
        for key, value in self.DEFAULTS.items():
            if key not in self._config:
                self.set(key, value)
    
    @property
    def api_key(self) -> Optional[str]:
        """Get the Anthropic API key."""
        return self.get("API_KEY")
    
    @property
    def model(self) -> str:
        """Get the model name."""
        return self.get("model")
    
    @property
    def max_tokens(self) -> int:
        """Get the max tokens."""
        return self.get("max_tokens")
    
    @property
    def temperature(self) -> float:
        """Get the temperature."""
        return self.get("temperature")
    
    @property
    def system_prompt(self) -> str:
        """Get the system prompt."""
        return self.get("system_prompt")
    
    def validate(self) -> bool:
        """
        Validate that required configuration is present.
        
        Returns:
            True if configuration is valid, False otherwise.
        """
        if not self.api_key:
            return False
        return True


def create_config(
    config_dir: Optional[str] = None,
    load_env: bool = True,
    env_prefix: str = ""
) -> Config:
    """
    Factory function to create a Config instance.
    
    Args:
        config_dir: Directory containing configuration files.
        load_env: Whether to load environment variables from .env.
        env_prefix: Prefix for environment variables.
        
    Returns:
        A Config instance.
    """
    return Config(config_dir=config_dir, env_prefix=env_prefix)


def create_agent_config(config_dir: Optional[str] = None) -> AgentConfig:
    """
    Factory function to create an AgentConfig instance.
    
    Args:
        config_dir: Directory containing configuration files.
        
    Returns:
        An AgentConfig instance.
    """
    return AgentConfig(config_dir=config_dir)
