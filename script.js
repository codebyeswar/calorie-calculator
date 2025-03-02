document.addEventListener("DOMContentLoaded", function () {
    // Handle height input toggle based on selection (cm or ft/in)
    document.querySelectorAll('input[name="height_unit"]').forEach((radio) => {
        radio.addEventListener("change", function () {
            document.getElementById("height_cm_input").style.display = this.value === "cm" ? "block" : "none";
            document.getElementById("height_ft_in_input").style.display = this.value === "ft" ? "block" : "none";
        });
    });

    // Disable toggling before calculation
    let toggleEnabled = false;

    function toggleResult(index) {
        if (!toggleEnabled) return; // Prevent toggle before calculation

        const headings = [
            ["Mild Weight Loss", "Mild Weight Gain"],
            ["Weight Loss", "Weight Gain"],
            ["Extreme Weight Loss", "Fast Weight Gain"]
        ];
        const values = [
            ["mild-weight-loss", "mild-weight-gain"],
            ["weight-loss", "weight-gain"],
            ["extreme-weight-loss", "fast-weight-gain"]
        ];

        const headingElement = document.getElementById(`toggle-heading-${index}`);
        const valueElement = document.getElementById(`toggle-value-${index}`);

        // Check current state and toggle to the other
        const isLoss = headingElement.textContent === headings[index - 1][0];
        headingElement.textContent = isLoss ? headings[index - 1][1] : headings[index - 1][0];
        
        const lossValue = document.getElementById(values[index - 1][0]).textContent;
        const gainValue = document.getElementById(values[index - 1][1]).textContent;

        valueElement.textContent = isLoss ? gainValue : lossValue;
    }

    window.toggleResult = toggleResult;

    // Handle form submission
    document.getElementById("calorie-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const age = document.getElementById("age").value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const weight_kg = document.getElementById("weight_kg").value;
        const activity_level = document.getElementById("activity_level").value;

        let height_cm = null;
        const height_unit = document.querySelector('input[name="height_unit"]:checked')?.value;

        if (height_unit === "cm") {
            height_cm = document.getElementById("height_cm").value;
            if (!height_cm) {
                alert("Please enter your height in cm!");
                return;
            }
        } else if (height_unit === "ft") {
            const height_ft = document.getElementById("height_ft").value;
            const height_in = document.getElementById("height_in").value;
            if (!height_ft || !height_in) {
                alert("Please enter both feet and inches for height!");
                return;
            }
            height_cm = (parseFloat(height_ft) * 30.48) + (parseFloat(height_in) * 2.54);
        } else {
            alert("Please select a height unit!");
            return;
        }

        if (!age || !gender || !weight_kg || !activity_level) {
            alert("Please fill all required fields!");
            return;
        }

        const data = {
            age: Number(age),
            gender: gender.toLowerCase(),
            weight_kg: Number(weight_kg),
            height_cm: Number(height_cm),
            activity_level: activity_level
        };

        fetch("http://127.0.0.1:5000/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((result) => {
            if (result.error) {
                alert("Error: " + result.error);
            } else {
                document.getElementById("maintain-weight").textContent = `${result.calories_needed} Calories/day`;
                document.getElementById("mild-weight-loss").textContent = `${Math.round(result.calories_needed * 0.9)} Calories/day`;
                document.getElementById("weight-loss").textContent = `${Math.round(result.calories_needed * 0.8)} Calories/day`;
                document.getElementById("extreme-weight-loss").textContent = `${Math.round(result.calories_needed * 0.6)} Calories/day`;
                document.getElementById("mild-weight-gain").textContent = `${Math.round(result.calories_needed * 1.1)} Calories/day`;
                document.getElementById("weight-gain").textContent = `${Math.round(result.calories_needed * 1.21)} Calories/day`;
                document.getElementById("fast-weight-gain").textContent = `${Math.round(result.calories_needed * 1.41)} Calories/day`;

                // Show the calorie values after clicking Calculate
                document.querySelectorAll(".result-item p").forEach(p => {
                    p.style.display = "block";
                });

                // Enable toggling after calculation
                toggleEnabled = true;
            }
        })
        .catch((error) => console.error("Fetch error:", error));
    });
});
