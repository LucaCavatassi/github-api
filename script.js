let page = 1;
let lastPageUrl = null;
let searchQuery = '';

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const nextBtn = document.getElementById('next-page');
const prevBtn = document.getElementById('prev-page');

// Fetching function for global search
async function getData(url = null) {

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
        }
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

function renderRepos(repos) {
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = ''; // Clear the list

    if (repos && repos.total_count > 0) {
        repos.items.forEach(repo => {
            const listItem = document.createElement('li');
            listItem.innerHTML = repo.name;
            repoList.appendChild(listItem);
        });
    } else if (repos.total_count === 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = 'No repositories found.';
            repoList.appendChild(listItem);
            console.log(repoList);
            
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
    page = 1; // Reset page to 1

    if (searchQuery.length > 3) {
        const repos = await getData();
        console.log(repos);
        
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
    const lastPage = new URL(lastPageUrl).searchParams.get('page')

    if (page > lastPage) {
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
    } else if (page === 1) {
        const repos = await getData(lastPageUrl);

        const newPage = new URL(lastPageUrl).searchParams.get('page')
        page=newPage
        
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Last page ";
    }
});