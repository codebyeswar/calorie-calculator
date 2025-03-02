from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend", template_folder="frontend")  # Define frontend folder
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow frontend requests

def calculate_calories(age, gender, height_cm, weight_kg, activity_level):
    # BMR calculation using Mifflin-St Jeor Equation
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    # Activity level multipliers
    activity_multipliers = {
        "BMR": 1.2,
        "Little or no exercise": 1.2,
        "Exercise 1-3 times/week": 1.375,
        "Exercise 4-5 times/week": 1.465,
        "Daily exercise or intense exercise 3-4 times/week": 1.55,
        "Intense exercise 6-7 times/week": 1.725,
        "Very intense exercise daily, or physical job": 1.9
    }

    # Adjust BMR based on activity level
    daily_calories = bmr * activity_multipliers.get(activity_level, 1.2)
    return round(daily_calories, 2)

# Serve the frontend (index.html)
@app.route('/')
def home():
    return render_template("index.html")  # Load index.html from frontend folder

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debugging

        # Validate required fields
        if not all(key in data for key in ['age', 'gender', 'weight_kg', 'height_cm', 'activity_level']):
            return jsonify({"error": "Missing required fields"}), 400

        age = int(data['age'])
        gender = data['gender']
        weight_kg = float(data['weight_kg'])
        height_cm = float(data['height_cm'])
        activity_level = data['activity_level']

        calories_needed = calculate_calories(age, gender, height_cm, weight_kg, activity_level)
        return jsonify({"calories_needed": calories_needed})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Invalid data format"}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
