// TODO: Wire up the app's behavior here.
const logItems = document.querySelectorAll('ul[data-cy="logs"] li');
const courseSelector = document.getElementById('course');
const logs = document.getElementById('logs');
const uvuIdInput = document.getElementById('uvuId');
const addLogBtn = document.querySelector('button[data-cy="add_log_btn"]');
const logTextarea = document.querySelector('textarea[data-cy="log_textarea"]');

const courseUrl =
  'https://jsonserverd3z3bl-zpgx--3000--f7aa08df.local-credentialless.webcontainer.io/courses';
const logUrl =
  'https://jsonserverd3z3bl-zpgx--3000--f7aa08df.local-credentialless.webcontainer.io/logs';
// Fetch data from the server for courses.
fetch(courseUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `Network response was not ok. Status: ${response.status}`
      );
    }
    return response.json();
  })
  .then((data) => {
    console.log('Fetched data:', data);

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format. Expected an array.');
    }
    const firstOption = document.createElement('option');
    firstOption.text = 'Choose Courses';
    // Add a new option for each course in the fetched data
    data.forEach((course) => {
      const option = document.createElement('option');
      option.value = course.id; // Assuming each course object has an 'id' property
      option.text = course.display; // Correcting the property to 'display'
      courseSelector.appendChild(option);
    });
  })
  .catch((error) => console.error('Error fetching or processing data:', error));

// Add change event listener to the course select element
courseSelector.addEventListener('change', function () {
  // Check if a course is selected
  if (courseSelector.value) {
    // Show the UVU ID input
    uvuIdInput.style.display = 'block';
  } else {
    // Hide the UVU ID input if no course is selected
    uvuIdInput.style.display = 'none';
  }
});

// Add input event listener to the UVU ID input for character length validation
uvuIdInput.addEventListener('input', function () {
  const uvuId = uvuIdInput.value;

  // Check if all characters are numbers
  const allCharactersAreNumbers = /^\d+$/.test(uvuId);

  // Update the input border color based on the validation result
  uvuIdInput.style.borderColor = allCharactersAreNumbers ? '' : 'red';

  // Check if the UVU ID is 8 digits
  if (allCharactersAreNumbers && uvuId.length === 8) {
    fetch(logUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok. Status: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched data:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format. Expected an array.');
        }

        // Clear existing logs before fetching and displaying new ones
        logs.innerHTML = '';
        uvuIdDisplay.textContent = `Student Logs for ${uvuId}`;

        // Add a new li element for each log in the fetched data
        data.forEach((log) => {
          const listItem = document.createElement('li');

          // Create the content for the li element
          listItem.innerHTML = `
          <div><small>${log.date}</small></div>
          <pre><p>${log.text}</p></pre>
          `;

          // Append the li element to the logs ul
          logs.appendChild(listItem);

          // Add click event listener to each li element
          listItem.addEventListener('click', () => {
            // Toggle the visibility of the pre element (comment)
            const comment = listItem.querySelector('pre p');
            comment.style.display =
              comment.style.display === 'none' ? 'block' : 'none';
          });
        });
      })
      .catch((error) =>
        console.error('Error fetching or processing data:', error)
      );

    uvuIdInput.value = uvuId;
    console.log('Valid UVU ID:', uvuId);
  } else {
    // Clear any previous results or messages
    console.log('Invalid UVU ID');
  }
  toggleAddLogButton();
});

function toggleAddLogButton() {
  addLogBtn.disabled = !(
    logs.innerHTML.trim() !== '' && logTextarea.value.trim() !== ''
  );
}

logTextarea.addEventListener('input', function () {
  // Toggle the "Add Log" button based on conditions
  toggleAddLogButton();
});

addLogBtn.addEventListener('click', function (event) {
  event.preventDefault();

  const uvuId = uvuIdInput.value;
  const courseId = courseSelector.value;
  const logText = logTextarea.value;

  // Check if all necessary information is available
  if (uvuId && courseId && logText) {
    // TODO: Use AJAX PUT to send the log data to json-server

    // Get the current date and time
    const currentDate = new Date().toLocaleString();
    fetch(logUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uvuId: uvuId,
        courseId: courseId,
        date: currentDate,
        text: logText,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok. Status: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        // Log success or handle response as needed
        console.log('Log added successfully:', data);

        // Clear the log textarea
        logTextarea.value = '';

        // Refresh the displayed logs
        uvuIdInput.dispatchEvent(new Event('input'));
      })
      .catch((error) => console.error('Error adding log:', error));
  }
});
