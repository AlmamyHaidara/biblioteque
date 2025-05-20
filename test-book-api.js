// Simple test script to debug book creation API
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:9999';
const EMAIL = 'admin@example.com'; // Replace with a valid user email
const PASSWORD = 'password123';    // Replace with the correct password

// Login and then create a book
async function testBookCreation() {
  try {
    // Step 1: Login to get token
    console.log('Attempting to login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    console.log('Login successful!');
    const token = loginData.data.accessToken;
    
    // Step 2: Get categories to find a valid category ID
    console.log('Fetching categories...');
    const categoriesResponse = await fetch(`${API_URL}/api/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const categoriesData = await categoriesResponse.json();
    
    if (!categoriesResponse.ok) {
      console.error('Failed to fetch categories:', categoriesData);
      return;
    }
    
    if (!categoriesData.data || !categoriesData.data.categories || categoriesData.data.categories.length === 0) {
      console.error('No categories found. Please create a category first.');
      return;
    }
    
    const categoryId = categoriesData.data.categories[0].id;
    console.log(`Using category ID: ${categoryId}`);
    
    // Step 3: Create a book with the token
    console.log('Attempting to create a book...');
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890123',
      publicationYear: 2023,
      publisher: 'Test Publisher',
      description: 'Test Description',
      quantity: 1,
      categoryId: categoryId
    };
    
    console.log('Book data being sent:', JSON.stringify(bookData, null, 2));
    
    const createBookResponse = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    });
    
    // Log raw response for debugging
    console.log('Response status:', createBookResponse.status);
    console.log('Response headers:', createBookResponse.headers.raw());
    
    const createBookData = await createBookResponse.json();
    
    if (!createBookResponse.ok) {
      console.error('Book creation failed:', createBookData);
    } else {
      console.log('Book created successfully:', createBookData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testBookCreation();
