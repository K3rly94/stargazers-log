const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

function formatDate(dateString) {
  // fallback if date is invalid
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

function createRepositoryElement(repository) {
  const article = document.createElement('article');
  article.className = 'repository';

  const details = document.createElement('div');
  const link = document.createElement('a');
  link.className = 'repository-name';
  link.href = repository.html_url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = repository.full_name || repository.name || 'Repository';

  const description = document.createElement('p');
  description.className = 'repository-description';
  description.textContent = repository.description || '';

  const meta = document.createElement('div');
  meta.className = 'repository-meta';
  const metaParts = [];
  if (repository.language) metaParts.push(repository.language);
  if (typeof repository.stargazers_count === 'number') {
    metaParts.push(`${repository.stargazers_count.toLocaleString()} stars`);
  }
  meta.textContent = metaParts.join('  /  ');

  const date = document.createElement('time');
  date.className = 'repository-date';
  if (repository.starred_at) {
    date.dateTime = repository.starred_at;
    date.textContent = `Starred ${formatDate(repository.starred_at)}`;
  } else {
    date.textContent = '';
  }

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
    if (repositoryCount) repositoryCount.textContent = 'Unavailable';
    if (repositoryList) {
      repositoryList.innerHTML = '<p class="status-message">The repository log could not be loaded. Try refreshing the page.</p>';
    }
    console.error(error);
  }
}

loadRepositories();
