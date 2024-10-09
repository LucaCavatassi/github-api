let page = 1;
let lastPageUrl = null;
let searchQuery = '';

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const nextBtn = document.getElementById('next-page');
const prevBtn = document.getElementById('prev-page');

// Fetching function for global search
async function getData(url = null) {
    // Define the API URL for global search based on the search query
    const apiUrl = url || `https://api.github.com/search/repositories?q=${searchQuery}&per_page=10&page=${page}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            },
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);

        // Access and store the Link header for pagination
        const linkHeader = response.headers.get('Link');
        if (!lastPageUrl && page === 1 && linkHeader) {
            lastPageUrl = getLastPageUrl(linkHeader);
            console.log("Last Page URL:", lastPageUrl);
        }

        return json;
    } catch (error) {
        console.error(error.message);
    }
}

function renderRepos(repos) {
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = ''; // Clear the list

    if (repos && repos.items) {
        repos.items.forEach(repo => {
            const listItem = document.createElement('li');
            listItem.innerHTML = repo.name;
            repoList.appendChild(listItem);
        });
    } else {
        repoList.innerHTML = '<li>No repositories found.</li>';
    }
}

function getLastPageUrl(linkHeader) {
    const links = linkHeader.split(", ");
    for (const link of links) {
        const [urlPart, relPart] = link.split("; ");
        if (relPart.includes('rel="last"')) {
            return urlPart.slice(1, -1);
        }
    }
    return null; // No last page found
}

searchButton.addEventListener("click", async () => {
    searchQuery = searchBar.value.trim();
    page = 1; // Reset page to 1 for new searches

    if (searchQuery.length > 3) {
        const repos = await getData();
        if (repos) {
            renderRepos(repos);
            document.getElementById('page-count').textContent = "Page number 1";
            document.getElementById('repo-count').innerHTML = "Number of repos: " + repos.total_count;
        }
    } else {
        alert('Minimum 3 characters required for search.');
    }
});

nextBtn.addEventListener('click', async () => {
    page++;
    const repos = await getData();

    if (repos && repos.items.length < 10) {
        page = 1; // Reset to first page if last page reached
        const firstPageRepos = await getData();
        renderRepos(firstPageRepos);
        document.getElementById('page-count').textContent = "Page number 1";
    } else {
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page number " + page;
    }
});

prevBtn.addEventListener('click', async () => {
    if (page > 1) {
        page--;
        const repos = await getData();
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page number " + page;
    }
});