from bs4 import BeautifulSoup as bs
from IPython.display import display
from IPython.display import HTML
from .color_conversion import is_valid_hex_color


def create_gradient_html(
    start_color_hex, mid_color_hex, end_color_hex, min_val, max_val
):
    """
    Generates and optionally displays an HTML file displaying a color gradient
    using BeautifulSoup. Accepts hex color codes. (Hover effect removed)

    Args:
        start_color_hex (str): Hex code for the start color (e.g., '#3B82F6').
        mid_color_hex (str): Hex code for the middle color (e.g., '#A855F7').
        end_color_hex (str): Hex code for the end color (e.g., '#EF4444').
        min_val (float or int): The minimum value for the gradient scale.
        max_val (float or int): The maximum value for the gradient scale.

    Raises:
        ValueError: If min_val is not less than max_val or if hex codes are invalid.
        TypeError: If min_val or max_val are not numbers.

    Returns:
        None: Displays the generated HTML in a Jupyter Notebook.
    """
    # --- Input Validation ---
    if not isinstance(min_val, (int, float)):
        raise TypeError("min_val must be a number.")
    if not isinstance(max_val, (int, float)):
        raise TypeError("max_val must be a number.")
    if min_val > max_val:
        raise ValueError("min_val must be less than max_val.")
    if not is_valid_hex_color(start_color_hex):
        raise ValueError(
            f"Invalid start_color_hex: {start_color_hex}. Must be like #RRGGBB or #RGB."
        )
    if not is_valid_hex_color(mid_color_hex):
        raise ValueError(
            f"Invalid mid_color_hex: {mid_color_hex}. Must be like #RRGGBB or #RGB."
        )
    if not is_valid_hex_color(end_color_hex):
        raise ValueError(
            f"Invalid end_color_hex: {end_color_hex}. Must be like #RRGGBB or #RGB."
        )

    # Calculate middle value
    mid_val = (min_val + max_val) / 2
    # Format values nicely (remove trailing .0 if integer)
    min_val_str = f"{min_val:.0f}" if float(min_val).is_integer() else f"{min_val:.2f}"
    mid_val_str = f"{mid_val:.0f}" if float(mid_val).is_integer() else f"{mid_val:.2f}"
    max_val_str = f"{max_val:.0f}" if float(max_val).is_integer() else f"{max_val:.2f}"

    # --- Base HTML Structure ---
    # Removed tooltip CSS, tooltip div, relative wrapper, data attributes, and script block
    base_html = """
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Color Gradient</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {{ font-family: 'Inter', sans-serif; }}
            /* Style for the tooltip */
            #gradient-tooltip {{
                position: absolute;
                display: none; /* Hidden by default */
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 4px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 10;
                pointer-events: none; /* Prevent tooltip from interfering with mouse events */
                transform: translate(-50%, -120%); /* Position above and centered on cursor */
            }}
        </style>
    </head>
    <body class="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
        <div class="p-6 sm:p-8 rounded-lg w-full max-w-2xl">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Value scale</h1>
            <div class="relative mb-2">
                <div id="gradient-bar"
                    class="h-10 sm:h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 cursor-crosshair"
                    data-min="{min_val}"
                    data-max="{max_val}">
                </div>
                <div id="gradient-tooltip"></div>
            </div>
            <div class="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-1">
                <div class="text-left">
                    <span class="font-medium">Min</span>
                    <div id="start-value"></div>
                    <div id="start-swatch" class="w-4 h-4 rounded-full inline-block border border-gray-400 dark:border-gray-600 align-middle ml-1"></div>
                </div>
                <div class="text-center">
                    <span class="font-medium">Middle</span>
                    <div id="mid-value"></div>
                    <div id="mid-swatch" class="w-4 h-4 rounded-full inline-block border border-gray-400 dark:border-gray-600 align-middle ml-1"></div>
                </div>
                <div class="text-right">
                    <span class="font-medium">Max</span>
                    <div id="end-value"></div>
                    <div id="end-swatch" class="w-4 h-4 rounded-full inline-block border border-gray-400 dark:border-gray-600 align-middle ml-1"></div>
                </div>
            </div>
        </div>
        <script>
            const gradientBar = document.getElementById('gradient-bar');
            const tooltip = document.getElementById('gradient-tooltip');
        </script>
    </body>
    </html>
"""

    # --- Parse and Modify HTML with BeautifulSoup ---
    soup = bs(base_html, "html.parser")

    # Update Title
    if soup.title:
        # Updated title to reflect non-interactive nature
        soup.title.string = f"Color Gradient: {min_val_str} to {max_val_str}"

    # Update Gradient Bar - Apply inline style for gradient
    gradient_bar = soup.find(id="gradient-bar")
    if gradient_bar:
        gradient_style = f"background: linear-gradient(to right, {start_color_hex}, {mid_color_hex}, {end_color_hex});"
        existing_style = gradient_bar.get("style", "")
        gradient_bar["style"] = (
            f"{existing_style}{';' if existing_style else ''}{gradient_style}"
        )
        # Remove cursor-crosshair if present (though removed from base_html already)
        existing_classes = gradient_bar.get("class", [])
        if "cursor-crosshair" in existing_classes:
            existing_classes.remove("cursor-crosshair")
        gradient_bar["class"] = existing_classes

    # Update Values
    start_val_div = soup.find(id="start-value")
    if start_val_div:
        start_val_div.string = min_val_str
    mid_val_div = soup.find(id="mid-value")
    if mid_val_div:
        mid_val_div.string = mid_val_str
    end_val_div = soup.find(id="end-value")
    if end_val_div:
        end_val_div.string = max_val_str

    # Update Color Swatches - Apply inline style for background color
    start_swatch = soup.find(id="start-swatch")
    if start_swatch:
        start_swatch["style"] = f"background-color: {start_color_hex};"

    mid_swatch = soup.find(id="mid-swatch")
    if mid_swatch:
        mid_swatch["style"] = f"background-color: {mid_color_hex};"

    end_swatch = soup.find(id="end-swatch")
    if end_swatch:
        end_swatch["style"] = f"background-color: {end_color_hex};"

    # Get the modified HTML as a string
    final_html = soup.prettify()
    display(HTML(final_html))
