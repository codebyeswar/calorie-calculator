from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend", template_folder="frontend")  # Define frontend folder
CORS(app, resources={r"/calculate": {"origins": "http://127.0.0.1:5500"}})  # Allow requests only from frontend

def calculate_calories(age, gender, height_cm, weight_kg, activity_level):
    """Calculates daily calorie needs based on Mifflin-St Jeor Equation."""
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    activity_multipliers = {
        "BMR": 1.2,
        "Little or no exercise": 1.2,
        "Exercise 1-3 times/week": 1.375,
        "Exercise 4-5 times/week": 1.465,
        "Daily exercise or intense exercise 3-4 times/week": 1.55,
        "Intense exercise 6-7 times/week": 1.725,
        "Very intense exercise daily, or physical job": 1.9
    }

    # Validate activity level
    if activity_level not in activity_multipliers:
        return None  

    return round(bmr * activity_multipliers[activity_level], 2)

# Serve the frontend (index.html)
@app.route('/')
def home():
    return render_template("index.html")  

@app.route('/calculate', methods=['POST'])
def calculate():
    """Handles calorie calculation requests."""
    try:
        data = request.get_json()
        print("Received data:", data)  # Debugging

        # Validate required fields
        required_fields = ['age', 'gender', 'weight_kg', 'height_cm', 'activity_level']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        try:
            age = int(data['age'])
            weight_kg = float(data['weight_kg'])
            height_cm = float(data['height_cm'])
        except ValueError:
            return jsonify({"error": "Age, weight, and height must be valid numbers"}), 400

        gender = data['gender'].lower()
        activity_level = data['activity_level']

        if gender not in ["male", "female"]:
            return jsonify({"error": "Invalid gender value"}), 400

        # Calculate calories
        calories_needed = calculate_calories(age, gender, height_cm, weight_kg, activity_level)
        if calories_needed is None:
            return jsonify({"error": "Invalid activity level"}), 400

        response = {
            "calories_needed": calories_needed,
            "mild_weight_loss": round(calories_needed * 0.9, 2),
            "weight_loss": round(calories_needed * 0.8, 2),
            "extreme_weight_loss": round(calories_needed * 0.6, 2),
            "mild_weight_gain": round(calories_needed * 1.1, 2),
            "weight_gain": round(calories_needed * 1.21, 2),
            "fast_weight_gain": round(calories_needed * 1.41, 2)
        }

        return jsonify(response)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5501)
