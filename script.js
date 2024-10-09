// Starting Page 
let page = 1;
let lastPageUrl = null;

// Fetching function
async function getData(url = null) {
    // Endpoint API
    const apiUrl = url || `https://api.github.com/user/repos?per_page=${10}&page=${page}`;

    try {
        // Assign constant to the fetching of data with headers.
        const response = await fetch (apiUrl, {
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

        // Access the Link header
        const linkHeader = response.headers.get('Link');
        // If lastpageurl it's null and if it's the first page and linksHeader it's retrieved get last page url
        if (!lastPageUrl && page === 1 && linkHeader) {
            lastPageUrl = getLastPageUrl(linkHeader);
            console.log(lastPageUrl);
        }

        // return the collection
        return json
    } catch (error) {
        console.error(error.message);
    }
}
// Basic rendering for repos
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

// Function to rendere the first 10 elements of collection at startup
document.addEventListener("DOMContentLoaded", async () => {
    // save the return of getData (json collection) into var repos and wait to fetch data
    const repos = await getData();
    // if data it's fetched apply render-repos
    if (repos) {
        renderRepos(repos);
    }
    document.getElementById('page-count').innerHTML =  "Page number 1";
});

// Function to parse the Link header and get the last page URL
function getLastPageUrl(linkHeader) {
    // create an array of two links + rel
    const links = linkHeader.split(", ");
    // console.log(links);
    
    // forof loop
    for (const link of links) {
        // divide link and rel
        const [urlPart, relPart] = link.split("; ");
        // console.log(urlPart, relPart);
        // if includes rel=last so it's the last page link return link
        if (relPart.includes('rel="last"')) {
            // console.log(urlPart);
            // slice the brackets
            return urlPart.slice(1, -1);
        }
    }
    return null; // Return null if no last page is found
}


// NextButton on DOM
let nextBtn = document.getElementById('next-page');
// Function to go next
nextBtn.addEventListener('click', async () => {
    // Increment page first
    page++;
    // Page number indicator
    document.getElementById('page-count').innerHTML =  "Page number " + page;

    // Fetch and render the updated data
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

// Function to go prev
prevBtn.addEventListener('click', async () => {
    if (page === 1 && lastPageUrl) {
        document.getElementById('page-count').innerHTML = "Last page";
        // Fetch and render the updated page of data
        const repos = await getData(lastPageUrl)
        if (repos) {
            renderRepos(repos);


            console.log(new URL (lastPageUrl));
            
            // Update page number to the last page after fetching the last page
            const lastPageNumber = new URL(lastPageUrl).searchParams.get("page");
            page = lastPageNumber;
        }

    } else if (page > 1) {
        // Reduce page
        page--
        // Page number indicator
        document.getElementById('page-count').innerHTML = "Page number " + page;
        // Fetch and render the updated page of data
        const repos = await getData();
        if (repos) {
            renderRepos(repos);
        }
    }
});