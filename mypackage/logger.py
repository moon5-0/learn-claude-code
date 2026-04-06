"""
Logger module for mypackage.

This module provides a simple Logger class for formatted logging to console
and optionally to a file.
"""

import os
from datetime import datetime


class Logger:
    """
    A simple logger class that supports formatted console and file logging.
    
    Attributes:
        log_file (str): The path to the log file. If None, file logging is disabled.
    
    Example:
        >>> logger = Logger()
        >>> logger.log("Application started", "INFO")
        [2024-01-01 12:00:00] INFO: Application started
        
        >>> logger.log_file = "app.log"
        >>> logger.log("Error occurred", "ERROR")
    """
    
    # Supported log levels in order of severity
    LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    
    def __init__(self, log_file=None):
        """
        Initialize the Logger instance.
        
        Args:
            log_file (str, optional): Path to the log file. Defaults to None.
        """
        self._log_file = log_file
    
    @property
    def log_file(self):
        """Get the path to the log file."""
        return self._log_file
    
    @log_file.setter
    def log_file(self, path):
        """
        Set the path to the log file.
        
        Args:
            path (str): Path to the log file.
        """
        self._log_file = path
    
    def _get_timestamp(self):
        """Get the current timestamp as a formatted string."""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def _format_message(self, message, level):
        """
        Format a log message with timestamp and level.
        
        Args:
            message (str): The log message.
            level (str): The log level.
            
        Returns:
            str: The formatted log message.
        """
        return f"[{self._get_timestamp()}] {level}: {message}"
    
    def log(self, message, level="INFO"):
        """
        Log a message to the console with the specified level.
        
        Args:
            message (str): The message to log.
            level (str): The log level. Must be one of DEBUG, INFO, WARNING, 
                        ERROR, CRITICAL. Defaults to "INFO".
        
        Raises:
            ValueError: If an invalid log level is provided.
        """
        level = level.upper()
        if level not in self.LOG_LEVELS:
            raise ValueError(f"Invalid log level: {level}. Must be one of {self.LOG_LEVELS}")
        
        formatted_message = self._format_message(message, level)
        print(formatted_message)
        
        # Also write to file if configured
        if self._log_file:
            self.write_to_file(formatted_message)
    
    def write_to_file(self, message):
        """
        Append a message to the log file.
        
        Args:
            message (str): The message to write to the file.
        
        Raises:
            IOError: If the log file cannot be written to.
        """
        if not self._log_file:
            return
        
        try:
            # Create the directory if it doesn't exist
            log_dir = os.path.dirname(self._log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)
            
            with open(self._log_file, "a") as f:
                f.write(message + "\n")
        except IOError as e:
            print(f"Error writing to log file: {e}")
    
    def debug(self, message):
        """Log a debug message."""
        self.log(message, "DEBUG")
    
    def info(self, message):
        """Log an info message."""
        self.log(message, "INFO")
    
    def warning(self, message):
        """Log a warning message."""
        self.log(message, "WARNING")
    
    def error(self, message):
        """Log an error message."""
        self.log(message, "ERROR")
    
    def critical(self, message):
        """Log a critical message."""
        self.log(message, "CRITICAL")


def main():
    """
    Demonstrate the usage of the Logger class.
    """
    print("=" * 50)
    print("Logger Demo")
    print("=" * 50)
    
    # Create a logger instance
    logger = Logger()
    
    # Demonstrate console logging with different levels
    print("\n--- Console Logging Demo ---")
    logger.log("This is a debug message", "DEBUG")
    logger.log("This is an info message", "INFO")
    logger.log("This is a warning message", "WARNING")
    logger.log("This is an error message", "ERROR")
    logger.log("This is a critical message", "CRITICAL")
    
    # Demonstrate using convenience methods
    print("\n--- Convenience Methods Demo ---")
    logger.debug("Debug using convenience method")
    logger.info("Info using convenience method")
    logger.warning("Warning using convenience method")
    logger.error("Error using convenience method")
    logger.critical("Critical using convenience method")
    
    # Demonstrate file logging
    print("\n--- File Logging Demo ---")
    log_file_path = "mypackage/demo.log"
    logger.log_file = log_file_path
    logger.log("Starting file logging demo", "INFO")
    logger.log("This message will be written to the log file", "INFO")
    logger.log("File logging demo complete", "INFO")
    
    print(f"\nLog file created at: {log_file_path}")
    
    # Display log file contents
    print("\n--- Log File Contents ---")
    try:
        with open(log_file_path, "r") as f:
            print(f.read())
    except IOError as e:
        print(f"Could not read log file: {e}")
    
    # Demonstrate error handling
    print("\n--- Error Handling Demo ---")
    try:
        logger.log("Invalid level test", "INVALID")
    except ValueError as e:
        print(f"Caught expected error: {e}")

    print("\n" + "=" * 50)
    print("Demo complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()