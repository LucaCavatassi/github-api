// Params for search
let page = 1;
let lastPageUrl = null;
let searchQuery = '';

// DOM Elements
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const nextBtn = document.getElementById('next-page');
const prevBtn = document.getElementById('prev-page');
const loader = document.getElementById('loader');
const repoList = document.getElementById("repo-list");


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
        // console.log(json);

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

// Last url retriever
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

// Search logic
searchButton.addEventListener("click", async () => {
    searchQuery = searchBar.value.trim();
    page = 1; // Reset page to 1

    let selection = document.getElementById('searchQuery');
    const selectedOption = selection.value;

    if (searchQuery.length > 3) {
        showLoader();

        let repos;

        if (selectedOption === 'repo') {
            repos = await getData(); // Use repository search API
            if (repos) {
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page number 1";
                document.getElementById('repo-count').textContent = "Number of repos: " + repos.total_count;
            }
        } else if (selectedOption === 'user') {
            repos = await getData(`https://api.github.com/search/users?q=${searchQuery}&per_page=10&page=${page}`); // Use user search API
            if (repos) {
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page number 1";
                document.getElementById('repo-count').textContent = "Number of users: " + repos.total_count;
            }
        }

        hideLoader();
    } else {
        alert('Minimum 3 characters required for search.');
    }
});

// Next logic
nextBtn.addEventListener('click', async () => {

    repoList.style.display = 'none';
    showLoader();

    page++;
    const repos = await getData();
    const lastPage = new URL(lastPageUrl).searchParams.get('page')

    if (page > lastPage) {
        page = 1; // Reset to first page if last page reached
        const firstPageRepos = await getData();

        hideLoader();
        repoList.style.display = 'block';

        renderRepos(firstPageRepos);
        document.getElementById('page-count').textContent = "Page number 1";
    } else {
        hideLoader();
        repoList.style.display = 'block';

        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page number " + page;
    }

    
});

// Prev logic
prevBtn.addEventListener('click', async () => {
    repoList.style.display = 'none';
    showLoader();

    if (page > 1) {
        page--;
        const repos = await getData();

        hideLoader();
        repoList.style.display = 'block';

        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page number " + page;
    } else if (page === 1) {
        const repos = await getData(lastPageUrl);

        const newPage = new URL(lastPageUrl).searchParams.get('page')
        page=newPage
        
        hideLoader();
        repoList.style.display = 'block';

        renderRepos(repos);
        document.getElementById('page-count').textContent = "Last page ";
    }
});

// Loader
function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}


// Rendering function
function renderRepos(repos) {
    repoList.innerHTML = ''; // Clear the list

    if (repos && repos.total_count > 0) {
        repos.items.forEach(repo => {
            const listItem = document.createElement('li');
            listItem.innerHTML = repo.login || repo.name;
            repoList.appendChild(listItem);
        });
    } else if (repos && repos.total_count === 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = 'No repositories found.';
            repoList.appendChild(listItem);
            console.log(repoList);
            
    }
}




