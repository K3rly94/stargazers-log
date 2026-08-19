const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

function formatDate(dateString) {
  const tryParse = d => (d instanceof Date && !Number.isNaN(d.getTime())) ? d : null;

  // Try parsing as-is, then try appending a time if that fails.
  let d = tryParse(new Date(dateString));
  if (!d) d = tryParse(new Date(`${dateString}T00:00:00`));
  if (!d) return dateString; // fallback to original string if parsing fails

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

  // Only create description element when there's something to show
  let description = null;
  if (repository.description) {
    description = document.createElement('p');
    description.className = 'repository-description';
    description.textContent = repository.description;
  }

  const meta = document.createElement('div');
  meta.className = 'repository-meta';
  const metaParts = [];
  if (repository.language) metaParts.push(repository.language);
  if (typeof repository.stargazers_count === 'number') {
    metaParts.push(`${repository.stargazers_count.toLocaleString()} stars`);
  }
  // Use a thin separator for better visuals
  meta.textContent = metaParts.join(' · ');

  const date = document.createElement('time');
  date.className = 'repository-date';
  if (repository.starred_at) {
    date.dateTime = repository.starred_at;
    date.textContent = `Starred ${formatDate(repository.starred_at)}`;
  } else {
    date.textContent = '';
  }

  details.append(link);
  if (description) details.append(description);
  details.append(meta);

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
    if (!Array.isArray(repositories)) throw new Error('Invalid data format: expected an array');

    repositoryCount.textContent = `${repositories.length} repositories`;
    // preserve order from file, but ensure we don't pass undefined
    repositoryList.replaceChildren(...repositories.map(createRepositoryElement));
  } catch (error) {
    if (repositoryCount) repositoryCount.textContent = 'Unavailable';
    if (repositoryList) {
      repositoryList.innerHTML = '<p class="status-message">The repository log could not be loaded. Try refreshing the page.</p>';
    }
    console.error(error);
  }
}

// Only attempt to load when the expected DOM is present
if (!repositoryList || !repositoryCount) {
  console.warn('Missing #repository-list or #repository-count in DOM — skipping repository load.');
} else {
  // Defer call to loadRepositories so that it runs after parsing (script is already deferred in HTML)
  loadRepositories();
}
