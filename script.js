document.getElementById('height-input-method').addEventListener('change', function() {
  const method = this.value;
  if (method === 'cm') {
      document.getElementById('height-cm-input').style.display = 'block';
      document.getElementById('height-ft-in-input').style.display = 'none';
  } else {
      document.getElementById('height-cm-input').style.display = 'none';
      document.getElementById('height-ft-in-input').style.display = 'block';
  }
});

document.getElementById('calorie-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const height_input_method = document.getElementById('height-input-method').value;
  const weight_lbs = document.getElementById('weight_lbs').value;
  const activity_level = document.getElementById('activity_level').value;

  let height_cm = null;
  if (height_input_method === 'cm') {
      height_cm = document.getElementById('height_cm').value;
  } else {
      const height_ft = document.getElementById('height_ft').value;
      const height_in = document.getElementById('height_in').value;
      height_cm = (parseInt(height_ft) * 30.48) + (parseInt(height_in) * 2.54);
  }

  const data = {
      age: age,
      gender: gender,
      height_cm: height_cm ? height_cm : null,
      weight_lbs: weight_lbs,
      activity_level: activity_level
  };

  fetch('/calculate', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      document.getElementById('result').innerHTML = `Calories needed: ${data.calories_needed}`;
  })
  .catch(error => {
      console.error('Error:', error);
  });
});
