// script.js

const getProfilePicture = async function () {
  try {
    const res = await fetch(
      'http://localhost:5000/api/v1/users/5c8a22c62f8fb814b56fa18b'
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Data fetched successfully:', data);

    if (data.data.doc && data.data.doc.photo) {
      document.querySelector(
        'img'
      ).src = `http://localhost:5000/img/users/${data.data.doc.photo}`;
    } else {
      console.log('Photo not found in the data:', data);
    }
  } catch (error) {
    console.error('Error fetching profile picture:', error);
  }
};

getProfilePicture();

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');

fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];

  console.log(file, 'FILE SELECTED');

  if (file) {
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML =
        '<img src="' + e.target.result + '" alt="Profile Photo">';
    };
    reader.readAsDataURL(file);

    // Prepare the file for uploading
    uploadPhoto(file);
    // getProfilePicture();
  } else {
    preview.innerHTML = '<p>No photo chosen</p>';
  }
});

// Function to send the photo to the server
async function uploadPhoto(file) {
  try {
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('photo', file);

    // Send the photo to the server using fetch
    const res = await fetch(
      'http://localhost:5000/api/v1/users/updateCurrentUser',
      {
        method: 'PATCH',
        body: formData,
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjOGEyMmM2MmY4ZmI4MTRiNTZmYTE4YiIsImlhdCI6MTcyNjIyNjQzNywiZXhwIjoxNzI4ODE4NDM3fQ.u2OLFDxaW9jzKfzGFkla5f4Y-BZDixDc8FUbxyIVpzw`, // Replace YOUR_TOKEN_HERE with the actual token
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to upload photo');
    }

    const data = await res.json();
    getProfilePicture();
    console.log('Photo uploaded successfully:', data);
  } catch (error) {
    console.error('Error uploading photo:', error);
  }
}
