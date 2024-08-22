// Fetch the JSON data from the server
fetch('/teachingContent')
  .then(response => response.json())
  .then(data => {
    // Get references to the divs
    const greenBox = document.querySelector('.bg-green-box');
    const yellowBox = document.querySelector('.bg-yellow-box');
    const blueBox = document.querySelector('.bg-blue-box');

    // Add the "card-title" and "card-description" classes
    const greenTitle = document.createElement('p');
    greenTitle.classList.add('card-title');
    greenTitle.textContent = "English";
    greenBox.appendChild(greenTitle);

    const greenDescription = document.createElement('p');
    greenDescription.classList.add('card-description');
    greenDescription.textContent = data['Daily Routine'].A1.Passage;
    greenBox.appendChild(greenDescription);

    const yellowTitle = document.createElement('p');
    yellowTitle.classList.add('card-title');
    yellowTitle.textContent = "Turkish";
    yellowBox.appendChild(yellowTitle);

    const yellowDescription = document.createElement('p');
    yellowDescription.classList.add('card-description');
    yellowDescription.textContent = data['Daily Routine'].A1.Translation;
    yellowBox.appendChild(yellowDescription);

    // Populate the blue box with the vocabulary lists
    const vocabulary = data['Daily Routine'].A1.Vocabulary;

    for (const [category, words] of Object.entries(vocabulary)) {
      const categoryContainer = document.createElement('div');
      const categoryTitle = document.createElement('p');
      categoryTitle.classList.add('card-title');
      categoryTitle.textContent = category;
      categoryContainer.appendChild(categoryTitle);

      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
      gridContainer.style.gap = '10px';

      words.forEach(word => {
        const wordContainer = document.createElement('li');
        wordContainer.classList.add('card-description');
        wordContainer.textContent = `${word.english} : ${word.translation}`;
        gridContainer.appendChild(wordContainer);
      });

      categoryContainer.appendChild(gridContainer);
      blueBox.appendChild(categoryContainer);
    }
  })
  .catch(error => console.error('Error loading JSON:', error));
