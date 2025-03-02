document.addEventListener("DOMContentLoaded", function () {
    // Handle height input toggle based on selection (cm or ft/in)
    document.querySelectorAll('input[name="height_unit"]').forEach((radio) => {
        radio.addEventListener("change", function () {
            // Show cm input when "cm" is selected, hide ft/in input
            if (this.value === "cm") {
                document.getElementById("height_cm_input").style.display = "block";
                document.getElementById("height_ft_in_input").style.display = "none";
            } 
            // Show ft/in inputs when "ft" is selected, hide cm input
            else if (this.value === "ft") {
                document.getElementById("height_cm_input").style.display = "none";
                document.getElementById("height_ft_in_input").style.display = "block";
            }
        });
    });

    // Ensure radio button selection works properly
    document.querySelectorAll('.selection-box .option input').forEach(radio => {
        radio.addEventListener('change', function () {
            let parentBox = this.closest('.selection-box');
            parentBox.querySelectorAll('.option').forEach(label => {
                label.classList.remove('selected');
            });
            this.parentElement.classList.add('selected');
        });
    });

    let toggleEnabled = false;

function toggleResult(index) {
    if (!toggleEnabled) return; // Prevent toggling before calculation

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

    const kgPerWeek = [
        ["0.25 kg/week", "0.25 kg/week"],
        ["0.5 kg/week", "0.5 kg/week"],
        ["1 kg/week", "1 kg/week"]
    ];

    // Get elements
    const headingElement = document.getElementById(`toggle-heading-${index}`);
    const lossElement = document.getElementById(values[index - 1][0]);
    const gainElement = document.getElementById(values[index - 1][1]);
    const kgWeekElement = document.getElementById(`kg-week-${index}`);

    if (!headingElement || !lossElement || !gainElement || !kgWeekElement) {
        console.error(`Toggle elements not found for index: ${index}`);
        return;
    }

    // Check if currently showing weight loss values
    const isLoss = lossElement.style.display !== "none";

    // Swap visibility of loss/gain values
    lossElement.style.display = isLoss ? "none" : "block";
    gainElement.style.display = isLoss ? "block" : "none";

    // Toggle heading text
    headingElement.textContent = isLoss ? headings[index - 1][1] : headings[index - 1][0];

    // Toggle kg per week text
    kgWeekElement.textContent = isLoss ? kgPerWeek[index - 1][1] : kgPerWeek[index - 1][0];
}

// Ensure function is globally available
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

        fetch("http://127.0.0.1:5501/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            console.log("Backend Response:", result);  // Debugging
            
            if (result.error) {
                alert("Error: " + result.error);
            } else {
                function updateText(id, value) {
                    let element = document.getElementById(id);
                    if (element) {
                        element.textContent = `${value} Calories/day`;
                    } else {
                        console.error(`Element with ID "${id}" not found!`);
                    }
                }
        
                // ✅ Matching IDs from index.html
                updateText("maintain-weight", result.calories_needed);
                updateText("mild-weight-loss", result.mild_weight_loss);
                updateText("weight-loss", result.weight_loss);
                updateText("extreme-weight-loss", result.extreme_weight_loss);
        
                // ✅ Make calorie values visible
                document.querySelectorAll(".result-item p").forEach(p => {
                    p.style.display = "block";
                });
            }
        })
        .catch(error => console.error("Fetch error:", error));
        
    });
});
