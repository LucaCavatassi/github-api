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

    if (searchQuery.length > 2) {
        repoList.innerHTML = '';
        showLoader();

        let repos;

        if (selectedOption === 'repo') {
            repos = await getData();
            if (repos) {
                showButtons(repos)
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page - 1";
                document.getElementById('repo-count').innerHTML = `Number of users found - <strong><em>${repos.total_count}</em></strong>`;
            }

        } else if (selectedOption === 'user') {
            repos = await getData(`https://api.github.com/search/users?q=${searchQuery}&per_page=10&page=${page}`);
            if (repos) {
                showButtons(repos)
                renderRepos(repos);
                document.getElementById('page-count').textContent = "Page - 1";
                document.getElementById('repo-count').innerHTML = `Number of users found - <strong><em>${repos.total_count}</em></strong>`;
            }

        }

        hideLoader();
        
    } else {
        alert('Minimum 3 characters required for search.');
    }
});

// Next logic
nextBtn.addEventListener('click', async () => {
    repoList.innerHTML = '';
    showLoader();

    page++;
    const repos = await getData();
    const lastPage = new URL(lastPageUrl).searchParams.get('page')

    if (page > lastPage) {
        page = 1; // Reset to first page if last page reached
        const firstPageRepos = await getData();
        renderRepos(firstPageRepos);
        document.getElementById('page-count').textContent = "Page - 1";
    } else {
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page - " + page;
    }

    hideLoader();
    
});

// Prev logic
prevBtn.addEventListener('click', async () => {
    repoList.innerHTML = '';
    showLoader();

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

    hideLoader();
});

// Loader
function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}
// Loader

// Rendering function
function renderRepos(repos) {
    
    repoList.innerHTML = '';

    // Create Div
    const div = document.createElement('div');
        div.classList.add('d-flex');
        div.classList.add('flex-wrap');
        div.classList.add('my-5');
        div.classList.add('gap-3');
        div.classList.add('flex-grow-1');


    if (repos && repos.total_count > 0) {
        repos.items.forEach(repo => {
            // Create Card
            const card = document.createElement('div')
            card.style.width = 'calc(95% / 2)'
            card.style.height = '90px'
            card.classList.add('card')
            // Create Card-body div
            const cardBody = document.createElement('div')
            cardBody.classList.add('card-body')
            card.appendChild(cardBody);

            // Create Card title
            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.textContent = repo.login || repo.name;
            cardBody.appendChild(cardTitle);

            div.appendChild(card);
        });
    } else if (repos && repos.total_count === 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = 'No repositories found.';
            repoList.appendChild(listItem);
            console.log(repoList);
            
    }

    repoList.appendChild(div);
}

// Buttons rendering
function showButtons (repos) {
    const totalCount = repos.total_count;
    const perPage = 10; // Assuming you're fetching 10 items per page

    if (totalCount > perPage) {
        // Show buttons if there are multiple pages
        document.getElementById('buttons').classList.remove('d-none')
        document.getElementById('buttons').classList.add('d-block')
    } else {
        // Hide buttons if there's only one page
        document.getElementById('buttons').classList.add('d-none')
        document.getElementById('buttons').classList.remove('d-block')
    }

}

