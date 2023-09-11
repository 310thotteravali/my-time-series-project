// This is a simplified example for a plain HTML/CSS/JavaScript app

// Function to fetch and display data from the backend
function fetchDataAndDisplay() {
  fetch("http://localhost:3004/api/data") // Replace with your backend API endpoint
    .then((response) => response.json())
    .then((data) => {
      // Process and display the data on the frontend
      displayData(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Function to display data on the frontend
function displayData(data) {
  // Clear the existing data on the frontend (if any)
  const dataList = document.getElementById("data-list");
  dataList.innerHTML = "";

  // Iterate through the data and create HTML elements to display it
  data.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Name: ${item.name}, Origin: ${item.origin}, Destination: ${item.destination}`;
    dataList.appendChild(listItem);
  });
}

// Fetch and display data when the page loads
window.addEventListener("load", () => {
  fetchDataAndDisplay();
});
