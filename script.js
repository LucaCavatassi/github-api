// Starting Page 
let page = 1;
let lastPageUrl = null;

// Fetching function
async function getData(url = null) {
    // Endpoint API
    const apiUrl = url || "https://api.github.com/user/repos";

    try {
        // Assign constant to the fetching of data with headers.
        const response = await fetch(`${apiUrl}?per_page=${10}&page=${page}`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer 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",
                "X-GitHub-Api-Version": "2022-11-28"
            },
        });

        // If no response throw error
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        // Else save response into json const as json collection and log it
        const json = await response.json();
        console.log(json);

         // If it's the first call, extract the last page URL from the Link header
        // Access the Link header
        const linkHeader = response.headers.get('Link');
        console.log(linkHeader);

        if (page === 1 && linkHeader) {
            lastPageUrl = getLastPageUrl(linkHeader);
        }

        // return the collection
        return json
    } catch (error) {
        console.error(error.message);
    }
}
// ReposRender basic
function renderRepos(repos) {
    // Select DOM Element
    const repoList = document.getElementById("repo-list");
    // Empty it
    repoList.innerHTML = '';

    // forEach loop with array i return from getData()
    repos.forEach(repo => {
        // create li-element
        const listItem = document.createElement('li')
        // insert repo.name into it
        listItem.innerHTML = repo.name;
        // insert li-element into DOM Element
        repoList.appendChild(listItem);
    });
}

// At startup first 10 rendered
document.addEventListener("DOMContentLoaded", async () => {
    // save the return of getData (json collection) into var repos and wait to fetch data
    const repos = await getData();
    // if data it's fetched apply render-repos
    if (repos) {
        renderRepos(repos);
    }
});

// Function to parse the Link header and get the last page URL
function getLastPageUrl(linkHeader) {
    const links = linkHeader.split(", ");
    for (const link of links) {
        const [urlPart, relPart] = link.split("; ");
        if (relPart.includes('rel="last"')) {
            return urlPart.slice(1, -1); // Remove angle brackets and return the URL
        }
    }
    return null; // Return null if no last page is found
}




// NextButton on DOM
let nextBtn = document.getElementById('next-page');
nextBtn.addEventListener('click', async () => {
    // Increment page first
    page++;

    // Fetch and render the new page of data
    const repos = await getData();
    if (repos) {
        renderRepos(repos);
    }

    // Reset to first page if less than perPage repos fetched (end of pages)
    if (repos.length < 10) {
        page = 1;
    }
});

// PrevButton on DOM
let prevBtn = document.getElementById('prev-page');
// PrevFunction
prevBtn.addEventListener('click', async () => {
    // Ensure page doesn’t go below 1
    if (page > 1) {
        page--; // Decrement page first
    }

    // Fetch and render the updated page of data
    const repos = await getData();
    if (repos) {
        renderRepos(repos);
    }
});