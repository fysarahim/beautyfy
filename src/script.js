// Get elements
const productTypeInput = document.getElementById('product');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const brandInput = document.getElementById('brand');
const productResultElement = document.getElementById('productResult');
const saveBoxElement = document.getElementById('saveBox');
const fileNameInput = document.getElementById('fileName');
const readResultElement = document.getElementById('readResult');
const favoritesListElement = document.getElementById('favoritesList');

// Initialize favorites array
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Function to get beauty products
async function getBeautyProducts() {
    const productType = productTypeInput.value.toLowerCase().trim();
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
    const brand = brandInput.value.toLowerCase().trim();

    let url = `http://makeup-api.herokuapp.com/api/v1/products.json`;
    const params = new URLSearchParams();
    if (productType) params.append('product_type', productType);
    if (brand) params.append('brand', brand);
    if (params.toString()) url += `?${params.toString()}`;

    if (!productType && !brand) {
        alert('Please enter a product type or brand');
        return;
    }
    
    try {
        productResultElement.innerHTML = '<div class="loading">Loading products...</div>';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error(`No products found for the specified criteria.`);
        }
    
        // Filter products based on price range
        const filteredProducts = data.filter(product => {
            const price = parseFloat(product.price) || 0;
            return price >= minPrice && price <= maxPrice;
        });
    
        if (filteredProducts.length === 0) {
            throw new Error(`No products found in the price range $${minPrice} - $${maxPrice}.`);
        }
    
        // Build HTML for product display
        productResultElement.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image_link}" 
                         alt="${product.name}" 
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-price">Price: $${parseFloat(product.price || 0).toFixed(2)}</p>
                    <p class="product-type">Type: ${product.product_type || 'N/A'}</p>
                    <p class="product-description">${(product.description || 'No description available').slice(0, 200)}...</p>
                    <a href="${product.product_link}" target="_blank" class="view-button">View Product</a>
                    <button onclick="toggleFavorite('${product.id}')" class="favorite-button ${favorites.includes(product.id) ? 'favorited' : ''}">
                        ${favorites.includes(product.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `).join('');
    
        saveBoxElement.style.display = 'block';
        productResultElement.scrollIntoView({ behavior: 'smooth' });
    
    } catch (error) {
        productResultElement.innerHTML = `
            <div class="error-message">
                <p> Error: ${error.message}</p>
                <p>Popular product types you can try: blush, mascara, foundation, eyeshadow, lipstick.</p>
                <p>Popular brands you can try: maybelline, l'oreal, covergirl, nyx, revlon.</p>
            </div>
        `;
        saveBoxElement.style.display = 'none';
    }
}

// Function to save product data
function saveProductData() {
    const brand = brandInput.value.trim() || 'all_brands';
    const productData = productResultElement.innerHTML;

    if (!productData) {
        alert('No product data to save');
        return;
    }

    localStorage.setItem(brand, productData);
    alert('Product information saved successfully!');
}

// Function to read product data
function readProductData() {
    const fileName = fileNameInput.value.trim();
    const data = localStorage.getItem(fileName);

    if (!data) {
        alert('No saved data found.');
        return;
    }

    readResultElement.innerHTML = `
        <div class="file-operations">
            <textarea id="fileContent" class="file-content">${data}</textarea>
            <div class="file-buttons">
                <button onclick="saveEditedData('${fileName}')" class="save-button">Save Changes</button>
                <button onclick="deleteProductData('${fileName}')" class="delete-button">Delete File</button>
            </div>
        </div>
    `;
}

// Function to save edited product data
function saveEditedData(fileName) {
    const newData = document.getElementById('fileContent').value;
    localStorage.setItem(fileName, newData);
    alert('Changes saved successfully!');
}

// Function to delete product data
function deleteProductData(fileName) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    localStorage.removeItem(fileName);
    alert('File deleted successfully!');
    readResultElement.innerHTML = '';
}

// Function to toggle favorite
function toggleFavorite(productId) {
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
    } else {
        favorites.push(productId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Function to display favorites
function displayFavorites() {
    const favoriteProducts = productResultElement.querySelectorAll('.product-card');
    favoriteProducts.forEach(product => {
        const productId = product.querySelector('.favorite-button').getAttribute('onclick').match(/'(.*)'/)[1];
        product.querySelector('.favorite-button').classList.toggle('favorited', favorites.includes(productId));
        product.querySelector('.favorite-button').textContent = favorites.includes(productId) ? 'Remove from Favorites' : 'Add to Favorites';
    });

    // Display favorites list
    favoritesListElement.innerHTML = favorites.map(id => {
        const product = Array.from(productResultElement.querySelectorAll('.product-card')).find(p => p.querySelector('.favorite-button').getAttribute('onclick').match(/'(.*)'/)[1] === id);
        return product ? `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.querySelector('img').src}" alt="${product.querySelector('.product-name').textContent}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.querySelector('.product-name').textContent}</h3>
                    <p class="product-brand">${product.querySelector('.product-brand').textContent}</p>
                    <p class="product-price">${product.querySelector('.product-price').textContent}</p>
                    <button onclick="toggleFavorite('${id}')" class="favorite-button favorited">Remove from Favorites</button>
                </div>
            </div>
        ` : '';
    }).join('');
}

// Call displayFavorites on page load to show any previously saved favorites
document.addEventListener('DOMContentLoaded', displayFavorites);