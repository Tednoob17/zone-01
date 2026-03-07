from setuptools import setup, find_packages

setup(
    name="vizard",  # The name of package
    version="0.1.0",  # The initial release version
    author="Data Team Force",  # Team name
    author_email="masseck.thiaw@01talent.com",  # email
    description="A simple library for analytical graphs.",  # A short description
    packages=find_packages(
        include=["circular_graph.*", "circular_graph"]
    ),  # add packages in project
    install_requires=[  # A list of other packages project needs
        "matplotlib<=3.10.0",
        "pandas<=2.2.0",
        "numpy<=2.1.0",
        "plotly<=5.24.1",
        "IPython<=8.30.0",
        "beautifulsoup4<=4.12.2",
    ],
    python_requires=">=3.8",  # Minimum Python version requirement
    py_modules=[
        "circular_graph.modular_graph"
    ],  # Name of the python module (single file)
)
