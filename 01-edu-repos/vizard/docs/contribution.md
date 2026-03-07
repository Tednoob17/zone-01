
# CONTRIBUTION

## Creation of a new module
- Go to the root of the repository
- Create a new folder and give a cool name
- Follow contribution rules and best practices

---
## Development best practices
- Use relative imports inside the package (e.g. `from .color_conversion import ...`) to avoid ambiguity.
- Comment your code
- Add docstring to your function, it is used to generate the documentation. The docstring must follow the `google rules`
```python
# Google docstring rules
#Ex: 
def example(a: str) -> int :
    """convert string to integer

    Args:
        a (str): integer

    Raise: (this part is not mandatory)
        error 

    Returns:
        integer
    """
        
```
- Always format your python code *(see makefile)*

---
## Contributing
- create a feature branch, open a PR with a description.
- Update `documentation.md` for any changes to modules structure or new parameters by executing another build with `mkdocs serve`.
- create new markdow file in `docs` folder for new modules and follow structure in yml file