function displayWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    works.forEach(work => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

async function getCategories() {
    const response = await fetch('http://localhost:5678/api/categories');
    const categories = await response.json();
    console.log("Récupération catégories :", categories);
    return categories;
}

function createFilters(categories) {
    const portfolio = document.getElementById('portfolio');
    const gallery = document.querySelector('.gallery');

    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'filters';

    const btnAll = document.createElement('button');
    btnAll.textContent = 'Tous';
    btnAll.className = 'filter-btn active';
    btnAll.dataset.categoryId = '0';
    filtersDiv.appendChild(btnAll);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.className = 'filter-btn';
        btn.dataset.categoryId = category.id;
        filtersDiv.appendChild(btn);
    });

    portfolio.insertBefore(filtersDiv, gallery);

    console.log("🔘 Boutons de filtre créés !");
}

function addFilterEvents(works) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const categoryId = button.dataset.categoryId;

            console.log("🔘 Catégorie sélectionnée :", categoryId);
            if (categoryId === "0") {
                displayWorks (works)
            } else {
                displayWorks (works.filter(work => work.categoryId === Number(categoryId)))

            }
        });
    });
}

async function init() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        const works = await response.json();

        displayWorks(works);

        const categories = await getCategories();

        createFilters(categories);
        
        addFilterEvents(works);

        console.log("Projets affichés !");

    } catch (error) {
        console.error("Erreur :", error);
    }
}

init();