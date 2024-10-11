// Params for url query
let page = 1;
const perPage = 10;
let lastPageUrl = null;
let searchQuery = '';
let selectedOption = 'repo';

// DOM Elements
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");
const nextBtn = document.getElementById('next-page');
const prevBtn = document.getElementById('prev-page');
const loader = document.getElementById('loader');
const repoList = document.getElementById("repo-list");


// Updated getData function with searchType parameter
async function getData(url = null, searchType = 'repo') {
    // Choose the appropriate API URL based on search type
    const apiUrl = url || `https://api.github.com/search/${searchType === 'user' ? 'users' : 'repositories'}?q=${searchQuery}&per_page=${perPage}&page=${page}`;

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

        const linkHeader = response.headers.get('Link');
        if (!lastPageUrl && page === 1 && linkHeader) {
            lastPageUrl = getLastPageUrl(linkHeader);
        }

        return json;
    } catch (error) {
        console.error(error.message);
    }
}

// Search logic
searchButton.addEventListener("click", async () => {
    repoList.innerHTML = '';
    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = '';

    searchQuery = searchBar.value.trim();
    page = 1;

    let selection = document.getElementById('searchQuery');
    const selectedOption = selection.value; // Determine search type here

    if (searchQuery.length > 2) {
        showLoader();
        let repos;

        // Pass selectedOption directly to getData
        repos = await getData(null, selectedOption);
        
        if (repos) {
            showButtons(repos);
            renderRepos(repos);
            document.getElementById('page-count').textContent = "Page - 1";
            document.getElementById('repo-count').innerHTML = `Number of ${selectedOption === 'user' ? 'users' : 'repositories'} found - <strong><em>${repos.total_count}</em></strong>`;
        }
        hideLoader();
    } else {
        errorMessage.innerHTML = '<h1 class="text-center my-4">Please type at least 3 characters in the searchbar.</h1>';
    }
});

// Next button logic
nextBtn.addEventListener('click', async () => {
    repoList.innerHTML = '';
    showLoader();
    page++;

    const selection = document.getElementById('searchQuery');
    const selectedOption = selection.value; // Use selected option for next/prev actions as well

    const repos = await getData(null, selectedOption);
    const lastPage = new URL(lastPageUrl).searchParams.get('page');

    if (page > lastPage) {
        page = 1;
        const firstPageRepos = await getData(null, selectedOption);
        renderRepos(firstPageRepos);
        document.getElementById('page-count').textContent = "Page - 1";
    } else {
        renderRepos(repos);
        document.getElementById('page-count').textContent = "Page - " + page;
    }
    hideLoader();
});

// Previous button logic
prevBtn.addEventListener('click', async () => {
    repoList.innerHTML = '';
    showLoader();

    if (page > 1) {
        page--;
    } else if (page === 1) {
        page = new URL(lastPageUrl).searchParams.get('page');
    }

    const selection = document.getElementById('searchQuery');
    const selectedOption = selection.value; // Use selected option for next/prev actions as well

    const repos = await getData(null, selectedOption);
    renderRepos(repos);
    document.getElementById('page-count').textContent = "Page - " + page;
    hideLoader();
});

// Last url retriever
function getLastPageUrl(linkHeader) {
    // Since links are two strings divided by a , split by ,
    const links = linkHeader.split(", ");
    // For each of strings in the created array by split
    for (const link of links) {
        // Deconstruct into urlPart and relPart each link
        const [urlPart, relPart] = link.split("; ");
        // If includes rel=last so it's the last page url return it without brackets
        if (relPart.includes('rel="last"')) {
            return urlPart.slice(1, -1);
        }
    }
    // If nothing found return null
    return null;
}

// Show loader
function showLoader() {
    loader.style.display = 'block';
}
// Hide loader
function hideLoader() {
    loader.style.display = 'none';
}

// Rendering function
function renderRepos(repos) {
    // Each render clear the main div
    repoList.innerHTML = '';

    // Create Div with bootstrap classes
    const div = document.createElement('div');
        div.classList.add('row');
        div.classList.add('flex-wrap');
        div.classList.add('my-2');
        div.classList.add('g-3');
        div.classList.add('flex-grow-1')

    // If repos exist and more than 0 create the card and insert the data.
    if (repos && repos.total_count > 0) {
        repos.items.forEach(repo => {
            // CREATE CARD
            const card = document.createElement('div');
            // Style
            card.classList.add('card');
            card.classList.add('d-flex');
            card.classList.add('flex-row');
            card.classList.add('col-12');
            card.classList.add('col-md-6');
            card.classList.add('px-0');
            card.style.height = '90px';

            // CREATE CARD IMG
            const cardImg = document.createElement('img');
            // Style
            cardImg.classList.add('card-img-top');
            cardImg.style.width = '30%';
            cardImg.style.height = '100%';
            cardImg.style.objectFit = 'cover';
            cardImg.style.borderTopRightRadius = 0;
            cardImg.style.borderBottomRightRadius = 0;

            // Display image based on repo structure
            cardImg.src = repo.avatar_url || repo.owner.avatar_url; 
            card.appendChild(cardImg);

            // CREATE CARD BODY
            const cardBody = document.createElement('div');
            // Style
            cardBody.classList.add('card-body');
            cardBody.classList.add('p-0');
            cardBody.classList.add('ps-3');
            cardBody.classList.add('pt-2');
            
            card.appendChild(cardBody);

            // CREATE CARD TITLE
            const cardTitle = document.createElement('a');
            // Style
            cardTitle.classList.add('card-title');
            cardTitle.classList.add('fw-bold');
            cardTitle.classList.add('fs-5');
            cardTitle.classList.add('mb-2');

            // Link to repo or user
            cardTitle.href = repo.html_url;
            // Open in another page
            cardTitle.setAttribute('target', '_blank');

            // Insert name or login(username) based on repo content
            cardTitle.textContent = repo.login || repo.name;
            cardBody.appendChild(cardTitle);   
            div.appendChild(card);

            // CREATE CARD INFO 
            const cardInfo = document.createElement('div');
            // Stars or Follower Style
            const cardStars = document.createElement('span');
            cardStars.classList.add('pt-2');
            cardStars.classList.add('pe-3');

            // Follower API Url
            const followers_url = repo.followers_url;
            // Function to getFollowers
            async function getFollowers() {
                // Fetch
                const resp = await fetch(followers_url);
                // Convert to Json
                const json = await resp.json();
                console.log(json);
                // Length = number
                return json.length;
            }
            // Function to render
            async function updateCardStars(repo) {
                // If there are stars so we are into repos search print repo stars
                if (repo.stargazers_count !== undefined) {
                    cardStars.innerHTML = `<i class="fa-solid fa-star"><span class='px-2'>${repo.stargazers_count}</span></i>`;
                // Else we are in users so get the followers from function and print it 
                } else {
                    const followers = await getFollowers();
                    cardStars.innerHTML = `<i class="fa-solid fa-user-plus"><span class='px-2'>${followers}</span></i>`;
                }
            }
            // Call the function and pass the repo
            updateCardStars(repo);
            // Append to div
            cardInfo.appendChild(cardStars);


            // Forks or repos
            const cardForks = document.createElement('span');
            const repos_url = repo.repos_url;

            async function getRepos() {
                // Fetch
                const resp = await fetch(repos_url);
                // Convert to Json
                const json = await resp.json();
                // Length = number
                return json.length;
            }
            // Same logic as for stars
            async function updateForks(repo) {
                if (repo.forks !== undefined) {
                    cardForks.innerHTML = `<i class="fa-solid fa-code-fork"><span class='px-2'>${repo.forks}</span></i>`;
                } else {
                    const repos = await getRepos();
                    cardForks.innerHTML = `<i class="fa-solid fa-folder-open"><span class='px-2'>${repos}</span></i>`
                }
            }
            updateForks(repo)
            // Append to cardInfo
            cardInfo.appendChild(cardForks);
            // Append cardInfo to whole body
            cardBody.appendChild(cardInfo);

        });
        // If there are repos but total count it's 0 no items found message
    } else if (repos && repos.total_count === 0) {
            // Create title
            const title = document.createElement('h1');
            // Style
            title.classList.add('text-center');
            title.classList.add('my-4');
            title.classList.add('text-center');
            // Style
            // Text message
            title.innerHTML = 'Sorry, nothing found.';
            document.getElementById('error-message').appendChild(title);
    }

    // Insert the div into the main div
    repoList.appendChild(div);
}

// Buttons rendering
function showButtons (repos) {
    // Count the number of repos
    const totalCount = repos.total_count;

    // If number of totale repos it's bigger then per page items meaning more then one page exist display buttons else hide
    if (totalCount > perPage) {
        document.getElementById('buttons').classList.remove('d-none')
        document.getElementById('buttons').classList.add('d-block')
    } else {
        document.getElementById('buttons').classList.add('d-none')
        document.getElementById('buttons').classList.remove('d-block')
    }

}

