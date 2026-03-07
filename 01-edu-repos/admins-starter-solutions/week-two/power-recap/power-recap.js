// Step 1: Select the elements by their IDs
let searchInput = document.getElementById("searchInput");
let searchButton = document.getElementById("searchButton");
let searchResult = document.getElementById("searchResult");

// Step 2: Add an event listener to the searchButton
searchButton.addEventListener("click", function () {
    // Step 3: Retrieve the value from the input field
    let userInput = searchInput.value;

    // Step 4: Check if input is empty
    if (userInput.trim() === "") {
        // Step 5: Display "Please enter a topic to search."
        searchResult.textContent = "Please enter a topic to search.";
    } else {
        // Step 6: Display: You searched for "content"
        searchResult.textContent = `You searched for: ${userInput}`;
    }
});