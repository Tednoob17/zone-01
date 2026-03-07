import re as re2


def to_slug(text: str, project_path_dict: dict) -> str:
    """Convert a string into a slug.

    Looks up `text` in `project_path_dict` and returns the mapped value when found.
    Otherwise produces a slug by lowercasing, replacing any sequence of non-alphanumeric
    characters with a single hyphen, and stripping leading/trailing hyphens.

    Args:
        text (str): Input string or key to look up in `project_path_dict`.
        project_path_dict (dict): Mapping of original names to replacement slugs.

    Returns:
        str: Slugified string or lookup value from `project_path_dict`.
    """

    try:
        txt = project_path_dict[text]
    except:
        # 1) lowercase
        txt = text.lower()
        # 2) replace any group of characters that are NOT a-z or 0-9 with a hyphen
        txt = re2.sub(r"[^a-z0-9]+", "-", txt)
        # 3) strip leading/trailing hyphens
    return txt.strip("-")


def replace_keys(input_dict, project_path_dict: dict) -> str:
    """Replace string keys in a mapping using `to_slug`.

    Iterates over `input_dict` and converts string keys to slugs using `to_slug`.
    Non-string keys are preserved.

    Args:
        input_dict (Mapping): Dictionary whose keys should be replaced.
        project_path_dict (dict): Mapping forwarded to `to_slug` for lookups.

    Returns:
        dict: New dictionary with transformed keys and original values.
    """
    new_dict = {}
    for key, value in input_dict.items():
        if isinstance(key, str):
            new_key = to_slug(key, project_path_dict)
        else:
            new_key = key
        new_dict[new_key] = value
    return new_dict
