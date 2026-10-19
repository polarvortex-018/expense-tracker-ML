from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base exception for all application-specific errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class EntityNotFoundError(AppException):
    """Raised when a requested database entity is not found."""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class BusinessValidationError(AppException):
    """Raised when a business rule or validation check fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


def register_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers for mapping core errors to responses."""
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.__class__.__name__,
                "detail": exc.message
            }
        )
