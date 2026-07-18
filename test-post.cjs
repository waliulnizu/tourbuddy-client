const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    // Generate a dummy file
    fs.writeFileSync('dummy.jpg', 'dummy content');
    
    const fd = new FormData();
    fd.append('name', 'Test');
    fd.append('designation', 'Test');
    fd.append('phone', 'Test');
    fd.append('status', 'active');
    fd.append('guide_image', fs.createReadStream('dummy.jpg'));
    
    // We need a valid token. Since we don't have one, we might get 401. 
    // Wait, let's login first to get a token.
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@tourbuddy.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    
    console.log('Got token, posting to guides...');
    
    const res = await axios.post('http://localhost:5000/api/admin/guides', fd, {
      headers: {
        ...fd.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  } finally {
    if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
  }
}

run();
