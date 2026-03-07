import re


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert a hex color string to an RGB tuple.

    Args:
        hex_color (str): Hex color string. May include a leading '#'.

    Returns:
        tuple[int, int, int]: RGB components as integers in the range 0-255.
    """
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    """Convert an RGB tuple to a hex color string.

    Args:
        rgb (tuple[int, int, int]): RGB components as integers in the range 0-255.

    Returns:
        str: Hex color string starting with '#'.
    """
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def is_valid_hex_color(color_string: str) -> bool:
    """Return whether a string is a valid 3- or 6-digit hex color.

    Args:
        color_string (str): Candidate color string (e.g. '#fff' or '#ffffff').

    Returns:
        bool: True if `color_string` is a valid hex color code, False otherwise.
    """
    if not isinstance(color_string, str):
        return False
    # Regex for # followed by 3 or 6 hex characters
    match = re.fullmatch(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", color_string)
    return bool(match)


def interpolate_color(
    value: int | float,
    max_value: int | float,
    start_color: str,
    mid_color: str,
    end_color: str,
) -> str:
    """Interpolate a color on a three-color gradient.

    The function maps `value` in the range [0, max_value] to a color by
    interpolating between `start_color` -> `mid_color` for the first half
    and `mid_color` -> `end_color` for the second half.

    Args:
        value (int | float): Input value to map to a color.
        max_value (int | float): Maximum value corresponding to the end of the gradient.
        start_color (str): Hex color for the 0% position (e.g. '#ff0000').
        mid_color (str): Hex color for the 50% position.
        end_color (str): Hex color for the 100% position.

    Returns:
        str: Interpolated hex color string (starting with '#').
    """
    from .color_conversion import hex_to_rgb, rgb_to_hex

    # Ensure value is within bounds
    value = max(0, min(value, max_value))
    ratio = value / max_value if max_value != 0 else 0.0

    # Choose the right range for interpolation (either start->mid or mid->end)
    if ratio <= 0.5:
        # Interpolating between start_color and mid_color
        start = hex_to_rgb(start_color)
        end = hex_to_rgb(mid_color)
        interp_ratio = ratio * 2  # Scale to 0-1
    else:
        # Interpolating between mid_color and end_color
        start = hex_to_rgb(mid_color)
        end = hex_to_rgb(end_color)
        interp_ratio = (ratio - 0.5) * 2  # Scale to 0-1

    # Calculate interpolated RGB values
    interpolated = tuple(
        int(start[i] + (end[i] - start[i]) * interp_ratio) for i in range(3)
    )

    # Convert back to hex and return
    return rgb_to_hex(interpolated)


def value_to_color(
    value: int | float, max_value: int | float, gradient_colors: list[str] = None
) -> str:
    """Map a numeric value to a color on a three-color gradient.

    If `gradient_colors` is provided and contains 3 hex colors, those are used
    as [start_color, mid_color, end_color]. Otherwise defaults are used.

    Args:
        value (int | float): Numeric value to map.
        max_value (int | float): Maximum value for normalization.
        gradient_colors (list[str], optional): List of three hex color strings.

    Returns:
        str: Hex color string resulting from the mapping.
    """

    start_color, mid_color, end_color = gradient_colors

    return interpolate_color(value, max_value, start_color, mid_color, end_color)
