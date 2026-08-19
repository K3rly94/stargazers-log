const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${dateString}T00:00:00`));
}

function createRepositoryElement(repository) {
  const article = document.createElement('article');
  article.className = 'repository';

  const details = document.createElement('div');
  const link = document.createElement('a');
  link.className = 'repository-name';
  link.href = repository.html_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = repository.full_name;

  const description = document.createElement('p');
  description.className = 'repository-description';
  description.textContent = repository.description;

  const meta = document.createElement('div');
  meta.className = 'repository-meta';
  meta.textContent = `${repository.language}  /  ${repository.stargazers_count.toLocaleString()} stars`;

  const date = document.createElement('time');
  date.className = 'repository-date';
  date.dateTime = repository.starred_at;
  date.textContent = `Starred ${formatDate(repository.starred_at)}`;

  details.append(link, description, meta);
  article.append(details, date);
  return article;
}

async function loadRepositories() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    repositoryCount.textContent = `${repositories.length} repositories`;
    repositoryList.replaceChildren(...repositories.map(createRepositoryElement));
  } catch (error) {
    repositoryCount.textContent = 'Unavailable';
    repositoryList.innerHTML = '<p class="status-message">The repository log could not be loaded. Try refreshing the page.</p>';
    console.error(error);
  }
}

loadRepositories();