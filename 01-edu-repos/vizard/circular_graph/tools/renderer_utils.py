from typing import Literal


# Function to return the appropriate JS function based on the type of info card
def show_info_card(
    type: Literal["classic", "distribution", "custom"] = "classic",
    keys: list[str] | None = None,
) -> str:
    """Return the appropriate JS function based on the visualization type.

    Args:
        type (Literal["classic", "distribution", "custom"], optional): Type of visualization.
            Defaults to "classic".
        keys (list[str] | None, optional): List of keys to display for custom type. Required when type="custom".

    Returns:
        str: JavaScript function as a string.
    """

    if type == "classic":
        return show_classic_info_card()
    elif type == "custom":
        if keys is None:
            raise ValueError("keys parameter is required when type='custom'")
        return show_custom_info_card(keys)
    else:
        raise ValueError("Invalid visualization type")


# JS function to display 'classic' informations dynamically (project name -> number)
def show_classic_info_card() -> str:
    """Return a JavaScript function string to display classic info cards.

    The returned JS function updates the info card's position and content
    based on the SVG element's attributes (project name, data-tooltip, cx, cy).

    Returns:
        str: JavaScript function as a string.
    """

    return """
    (function showInfoCard(el) { 
    el.style.cursor= "pointer";
    const infoCard = document.getElementById("info_card");
    const cardA = document.getElementById("card_a");
    const cardB = document.getElementById("card_b");
    const projectText = document.getElementById("project_name_card");
    const dataText = document.getElementById("data_card");
    const dataNumber = el.getAttribute("data-tooltip") || "0";
    /************************************************************/
    const card_a_x_shift = -54.0;
    const card_a_y_shift = -127.0;

    const card_b_x_shift = -53.5;
    const card_b_y_shift = -126.5;

    const project_text_x_shift = -38.46500000000003;
    const project_text_y_shift = -101.13599999999997;

    const data_text_x_shift = -22.649999999999977;
    const data_text_y_shift = -68.63599999999997;
    /************************************************************/
    const x = parseFloat(el.getAttribute("cx"));
    const y = parseFloat(el.getAttribute("cy"));
    const projectName = el.getAttribute("project-name") || el.getAttribute("id").toLowerCase();
    /***********************************************************/
    projectText.textContent = projectName;
    dataText.textContent = dataNumber;

    const projectTextWidth = projectText.getBBox().width;
    const dataTextWidth = dataText.getBBox().width;
    const base_card_width = parseFloat(cardA.getAttribute("data-width"));
    
    // Calculate max width needed
    const maxContentWidth = Math.max(projectTextWidth, dataTextWidth);
    const card_width = Math.max(base_card_width, maxContentWidth + 40);
    
    /***********************************************************/
    cardA.setAttribute("x", x + card_a_x_shift);
    cardA.setAttribute("y", y + card_a_y_shift);
    cardA.setAttribute("width", card_width);

    cardB.setAttribute("x", x + card_b_x_shift);
    cardB.setAttribute("y", y + card_b_y_shift);
    cardB.setAttribute("width", card_width);
    
    /***********************************************************/
    const cardCenterX = x + card_a_x_shift + (card_width / 2);
    
    projectText.setAttribute("x", cardCenterX);
    projectText.setAttribute("text-anchor", "middle");
    projectText.setAttribute("y", y + project_text_y_shift);

    dataText.setAttribute("x", cardCenterX);
    dataText.setAttribute("text-anchor", "middle");
    dataText.setAttribute("y", y + data_text_y_shift);
    infoCard.style.visibility = "visible";
    })(this)
    """


# JS function to display custom informations dynamically (project name -> dictionary)
def show_custom_info_card(keys: list[str]) -> str:
    """Return a JavaScript function string to display custom info cards.

    Args:
        keys (list[str]): List of keys to display from the data dictionary.

    Returns:
        str: JavaScript function as a string.
    """
    keys_json = str(keys).replace("'", '"')

    return f"""
    (function showInfoCard(el) {{ 
    el.style.cursor= "pointer";
    const infoCard = document.getElementById("info_card");
    const cardA = document.getElementById("card_a");
    const cardB = document.getElementById("card_b");

    const projectText = document.getElementById("project_name_card");
    const statHolder = document.getElementById("stat-holder");

    const datajson = el.getAttribute("data-tooltip") || "{{}}";
    const data = JSON.parse(datajson); 
    const sep = document.getElementById("separator");

    /*****************************/
    const card_a_x_shift = 1.0;
    const card_a_y_shift = -200.0; 
    const card_b_x_shift = 1;
    const card_b_y_shift = -200.5;
    
    const project_text_x_shift = 60.465;
    const project_text_y_shift = -175.136;
    const text_x_shift = 10.65;
    const text_y_shift = -120.636;
    const text_y_margin = 28;

    /*******************************************/
    const x = parseFloat(el.getAttribute("cx"));
    const y = parseFloat(el.getAttribute("cy"));
    const projectName = el.getAttribute("project-name") || el.getAttribute("id").toLowerCase();
 
    /*********************************************/
    projectText.textContent = projectName.toUpperCase();

    /*********************************************/
    const projectTextWidth = projectText.getBBox().width; 
    const base_card_width = parseFloat(cardA.getAttribute("data-width"));
    
    /***********************************************************/
    const dataKeys = {keys_json};
    const base_height = 100; 
    const height_per_key = 30;
    const total_card_height = base_height + (dataKeys.length * height_per_key);
    
    // Calculate max width needed for content
    let maxContentWidth = projectTextWidth;
    dataKeys.forEach((key) => {{
        const testText = key.charAt(0).toUpperCase() + key.slice(1) + " : " + (data[key] !== undefined ? data[key] : "N/A");
        const tempSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tempSpan.textContent = testText;
        tempSpan.setAttribute("font-family", "Inter");
        tempSpan.setAttribute("font-size", "18");
        statHolder.appendChild(tempSpan);
        const contentWidth = tempSpan.getBBox().width;
        if (contentWidth > maxContentWidth) {{
            maxContentWidth = contentWidth;
        }}
        statHolder.removeChild(tempSpan);
    }});
    
    const card_width = Math.max(base_card_width, maxContentWidth + 40);
    const cardX = x + card_a_x_shift;
    
    const size = document.getElementById('canevas').getAttribute('viewBox').split(' ').slice(2),
    total_width = parseFloat(size[0]), 
    total_height = parseFloat(size[1]), 
    limit_width = total_width / (1+1/5), 
    limit_height = total_height / 7, 

    y_factor = y <= limit_height + 15 ? -0.3 : 1,
    project_text_y_factor = y <= limit_height + 15 ? -0.5 : 1,
    text_y_factor = y <= limit_height + 15 ? -1.1 : 1,

    x_shift = x >= limit_width - 15 ? (card_width - card_a_x_shift) * -1  : card_a_x_shift;
    const centeredX =  x >= limit_width -15 
    ?  cardX - (card_width - projectTextWidth)
    : cardX + (card_width - projectTextWidth) / 2;
    
    cardA.setAttribute("height", total_card_height);
    cardB.setAttribute("height", total_card_height);

    cardA.setAttribute("x", x + x_shift);
    cardA.setAttribute("y", y + (card_a_y_shift * y_factor));
    cardA.setAttribute("width", card_width);

    cardB.setAttribute("x", x + x_shift);
    cardB.setAttribute("y", y + (card_b_y_shift * y_factor));
    cardB.setAttribute("width", card_width);

    /***********************************************/
    const cardCenterX = x + x_shift + (card_width / 2);
    
    projectText.setAttribute("x", cardCenterX);
    projectText.setAttribute("text-anchor", "middle");
    projectText.setAttribute("y", y + project_text_y_shift * project_text_y_factor);

    sep.setAttribute("x1", x + x_shift +5);
    sep.setAttribute("x2", x + x_shift + card_width - 5);
    
    sep.setAttribute("y1", y + (text_y_shift * text_y_factor) - 30);
    sep.setAttribute("y2", y + (text_y_shift * text_y_factor) - 30);

    /************* text color display + values handling **********************************/
    
    statHolder.textContent = "";
    
    dataKeys.forEach((key, index) => {{
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.textContent = key.charAt(0).toUpperCase() + key.slice(1) + " : " + (data[key] !== undefined ? data[key] : "N/A");
        tspan.setAttribute("x", cardCenterX);
        tspan.setAttribute("text-anchor", "middle");
        tspan.setAttribute("y", y + (text_y_shift* text_y_factor) + text_y_margin * index);
        tspan.setAttribute("fill", data[key] !== undefined ? "#66FFFA" : "grey");
        
        statHolder.appendChild(tspan);
    }});

    infoCard.style.visibility = "visible";

    }})(this)
    """
