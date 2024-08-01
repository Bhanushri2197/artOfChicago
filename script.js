// Function to fetch and display data for a specific page
async function fetchData(pageNumber) {
  try {
      // Fetch data from Art Institute of Chicago API
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=12`);
      const result = await response.json();
      console.log(result);

      // Get the container where cards will be displayed
      const cardGroup = document.getElementsByClassName("card-group")[0];
      cardGroup.innerHTML = ""; // Clear previous content

      // Iterate over each artwork in the data
      result.data.forEach(artwork => {
          // Create elements for the card
          let card = document.createElement("div");
          card.classList.add("card");

          let cardImg = document.createElement("img");
          cardImg.classList.add("card-img-top", "cardImg");
          cardImg.src = artwork.image_id ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg` : "img/default.jpeg";
          
          let cardBody = document.createElement("div");
          cardBody.classList.add("card-body");

          let cardTitle = document.createElement("h4");
          cardTitle.classList.add("card-title");
          cardTitle.innerHTML = artwork.title;

          let cardDes = document.createElement("p");
          cardDes.classList.add("cardDes");
          cardDes.innerHTML = "By : " + artwork.artist_title;

          let cardFooter = document.createElement("div");
          cardFooter.classList.add("card-footer");

          let downloadArt = document.createElement("button");
          downloadArt.classList.add("downloadBtn");
          downloadArt.innerText = "Download";

          // Function to download specific image
          downloadArt.addEventListener('click', () => {
              fetch(`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`)
              .then(response => response.blob())
              .then(blob => {
                  const url = URL.createObjectURL(blob);
                  const downloadLink = document.createElement('a');
                  downloadLink.href = url;
                  downloadLink.download = `${artwork.title}`;
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                  URL.revokeObjectURL(url);
              })
              .catch(error => console.error('Error downloading image:', error));
          });

          // Append elements to the card
          cardBody.append(cardTitle, cardDes);
          cardFooter.appendChild(downloadArt);
          card.append(cardImg, cardBody, cardFooter);

          // Append the card to the cardGroup
          cardGroup.appendChild(card);
      });

      // Handle pagination controls
      updatePaginationControls(result.pagination.current_page, result.pagination.total_pages);

  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

// Function to update pagination controls with truncation
function updatePaginationControls(currentPage, totalPages) {
  const pageList = document.getElementsByClassName("pageList")[0];
  const next = document.getElementsByClassName("nxtBtn")[0];
  const prev = document.getElementsByClassName("prevBtn")[0];

  pageList.innerHTML = ""; // Clear previous page links

  // Define the range for truncation
  const range = 2;
  let startPage = Math.max(1, currentPage - range);
  let endPage = Math.min(totalPages, currentPage + range);

  // Add "First" page link if needed
  if (startPage > 1) {
      const firstLink = document.createElement("a");
      firstLink.classList.add("pageLink");
      firstLink.innerHTML = "1";
      firstLink.addEventListener("click", () => fetchData(1));
      pageList.appendChild(firstLink);
      if (startPage > 2) {
          const ellipsis = document.createElement("span");
          ellipsis.innerHTML = "...";
          pageList.appendChild(ellipsis);
      }
  }

  // Add page links for the visible range
  for (let i = startPage; i <= endPage; i++) {
      let pageLink = document.createElement("a");
      pageLink.classList.add("pageLink");
      pageLink.innerHTML = i;
      if (i === currentPage) {
          pageLink.classList.add("active");
      }
      pageLink.addEventListener("click", () => fetchData(i));
      pageList.appendChild(pageLink);
  }

  // Add "Last" page link if needed
  if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
          const ellipsis = document.createElement("span");
          ellipsis.innerHTML = "...";
          pageList.appendChild(ellipsis);
      }
      const lastLink = document.createElement("a");
      lastLink.classList.add("pageLink");
      lastLink.innerHTML = totalPages;
      lastLink.addEventListener("click", () => fetchData(totalPages));
      pageList.appendChild(lastLink);
  }

  // Update next button
  next.disabled = currentPage >= totalPages;
  next.addEventListener("click", () => {
      if (currentPage < totalPages) {
          fetchData(currentPage + 1);
      }
  });

  // Update previous button
  prev.disabled = currentPage <= 1;
  prev.addEventListener("click", () => {
      if (currentPage > 1) {
          fetchData(currentPage - 1);
      }
  });
}

// Fetch initial data for the first page
fetchData(1);
