function displayWorks(works) {
    const gallery = document.querySelector('.gallery')
    gallery.innerHTML = ''

    works.forEach(work => {
        const figure = document.createElement('figure')
        const img = document.createElement('img')
        const figcaption = document.createElement('figcaption')

        img.src = work.imageUrl
        img.alt = work.title
        figcaption.textContent = work.title

        figure.appendChild(img)
        figure.appendChild(figcaption)
        gallery.appendChild(figure)
    })
}

function displayModalGallery(works) {
    const modalGallery = document.querySelector('.modal-gallery')
    modalGallery.innerHTML = ''

    works.forEach(work => {
        const figure = document.createElement('figure')
        const img = document.createElement('img')
        const deleteBtn = document.createElement('button')

        img.src = work.imageUrl
        img.alt = work.title
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>'
        deleteBtn.dataset.id = work.id

        deleteBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                // Supprimer de la modale
                figure.remove()
                // Supprimer de la galerie principale
                works.splice(works.indexOf(work), 1)
                displayWorks(works)
            }
        })

        figure.appendChild(img)
        figure.appendChild(deleteBtn)
        modalGallery.appendChild(figure)
    })
}

async function getCategories() {
    const response = await fetch('http://localhost:5678/api/categories')
    const categories = await response.json()
    return categories
}

function createFilters(categories) {
    const portfolio = document.getElementById('portfolio')
    const gallery = document.querySelector('.gallery')

    const filtersDiv = document.createElement('div')
    filtersDiv.className = 'filters'

    const btnAll = document.createElement('button')
    btnAll.textContent = 'Tous'
    btnAll.className = 'filter-btn active'
    btnAll.dataset.categoryId = '0'
    filtersDiv.appendChild(btnAll)

    categories.forEach(category => {
        const btn = document.createElement('button')
        btn.textContent = category.name
        btn.className = 'filter-btn'
        btn.dataset.categoryId = category.id
        filtersDiv.appendChild(btn)
    })

    portfolio.insertBefore(filtersDiv, gallery)
}

function addFilterEvents(works) {
    const filterButtons = document.querySelectorAll('.filter-btn')

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'))
            button.classList.add('active')

            const categoryId = button.dataset.categoryId

            if (categoryId === "0") {
                displayWorks(works)
            } else {
                displayWorks(works.filter(work => work.categoryId === Number(categoryId)))
            }
        })
    })
}

function setupModal(works, categories) {
    const modal = document.getElementById('modal')
    const closeButtons = document.querySelectorAll('.close-modal')
    const galleryView = document.getElementById('modal-gallery-view')
    const formView = document.getElementById('modal-form-view')
    const addPhotoBtn = document.querySelector('.add-photo-btn')
    const backBtn = document.querySelector('.back-btn')
    const categorySelect = document.getElementById('work-category')
    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        categorySelect.appendChild(option)
    })


    document.querySelector('.edit-btn').addEventListener('click', () => {
        modal.style.display = 'flex'
        galleryView.style.display = 'block'
        formView.style.display = 'none'
        displayModalGallery(works)
    })

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none'
        })
    })

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none'
        }
    })

    addPhotoBtn.addEventListener('click', () => {
        galleryView.style.display = 'none'
        formView.style.display = 'block'
    })

    backBtn.addEventListener('click', () => {
        formView.style.display = 'none'
        galleryView.style.display = 'block'
    })

    const addForm = document.getElementById('add-work-form')
    const titleInput = document.getElementById('work-title')
    const imageInput = document.getElementById('work-image')

    const submitBtn = addForm.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.style.backgroundColor = '#a0a0a0'

    function checkForm() {
        const hasImage = imageInput.files.length > 0
        const hasTitle = titleInput.value.trim() !== ''

        if (hasImage && hasTitle) {
            submitBtn.disabled = false
            submitBtn.style.backgroundColor = '#1D6154'
        } else {
            submitBtn.disabled = true
            submitBtn.style.backgroundColor = '#a0a0a0'
        }
    }

    imageInput.addEventListener('change', checkForm)
    titleInput.addEventListener('input', checkForm)

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const token = localStorage.getItem('token')

        const formData = new FormData()
        formData.append('title', titleInput.value)
        formData.append('category', categorySelect.value)
        formData.append('image', imageInput.files[0])

        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })

        if (response.ok) {
            const newWork = await response.json()
            works.push(newWork)
            displayWorks(works)
            displayModalGallery(works)
            formView.style.display = 'none'
            galleryView.style.display = 'block'
            addForm.reset()
        } else {
            alert('Erreur lors de l\'ajout')
        }
    })
}

async function init() {
    try {
        const response = await fetch('http://localhost:5678/api/works')
        const works = await response.json()

        displayWorks(works)

        const categories = await getCategories()
        createFilters(categories)
        addFilterEvents(works)

        const token = localStorage.getItem('token')

        if (token) {
            document.querySelector('#mode-edition').style.display = 'block'
            document.querySelector('#nav-login').innerText = 'logout'
            document.querySelector('.filters').style.display = 'none'
            setupModal(works, categories)
        }

    } catch (error) {
        console.error("Erreur :", error)
    }
}

init()