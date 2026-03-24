from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional

T = TypeVar("T")


class AbstractRepository(ABC, Generic[T]):
    """Base repository interface. Swap implementations to change DB backend."""

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[T]:
        ...

    @abstractmethod
    def get_all(self, **filters) -> list[T]:
        ...

    @abstractmethod
    def create(self, **kwargs) -> T:
        ...

    @abstractmethod
    def update(self, id: int, **kwargs) -> Optional[T]:
        ...

    @abstractmethod
    def delete(self, id: int) -> bool:
        ...
